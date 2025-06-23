import { inngest } from "../clint.js";
import User from "../../models/user.model.js";
import Ticket from "../../models/ticket.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/aiAgent.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-Ticket-Created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      const ticket = await step.run("get ticket by ID", async () => {
        const ticketObject = await Ticket.findById(ticketId).populate(
          "createdBy",
          ["email", "_id"]
        );

        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });
      await step.run("update ticket ststus", async () => {
        await Ticket.findByIdAndUpdate(ticketId, {
          status: "open",
        });
      });
      let aiResponse;
      try {
        aiResponse = await analyzeTicket(ticket);
      } catch (err) {
        console.error("🔥 Gemini API call failed:", err);
        throw err; // to make Inngest show error
      }

      const relatedSkills = await step.run("ai processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticketId, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes || "",
            relatedSkills: aiResponse.relatedSkills || [],
            status: "in-progress",
          });
        }
        skills = aiResponse.relatedSkills || [];
        return skills;
      });

      const moderator = await step.run("assign to moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({ role: "admin" });
        }
        await Ticket.findByIdAndUpdate(ticketId, {
          assignedTo: user._id,
        });
        return user;
      });

      await step.run("send email to moderator", async () => {
        const subject = `New Ticket Assigned: ${ticket.title}`;
        const text = `👋Hello ${moderator.email},\n\nA new ticket has been assigned to you:\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}\n\nPlease check the ticket and take necessary actions.\n\nBest regards,\nThe Team`;
        await sendEmail(moderator.email, subject, text);
      });
      await step.run("send email to user", async () => {
        const subject = `Your Ticket has been created: ${ticket.title}`;
        const text = `👋Hello ${ticket.createdBy.email},\n\nYour ticket has been successfully created and is now being assign to ${moderator.email} .\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\n\nWe will keep you updated on its status on to your ticket dashboard.\n\nBest regards,\nThe Team`;
        await sendEmail(ticket.createdBy.email, subject, text);
      });
      return { success: true };
    } catch (error) {
      console.error("❌Error in ticketCreated function:", error.message);
      return { success: false };
    }
  }
);

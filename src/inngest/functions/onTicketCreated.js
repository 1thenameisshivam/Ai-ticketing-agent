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
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticket) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run("update ticket ststus", async () => {
        await Ticket.findByIdAndUpdate(ticketId, {
          status: "open",
        });
      });

      const aiResponse = await analyzeTicket(ticket);

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
              $regex: relatedskills.join("|"),
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

      return { success: true };
    } catch (error) {
      console.error("❌Error in ticketCreated function:", error.message);
      return { success: false };
    }
  }
);

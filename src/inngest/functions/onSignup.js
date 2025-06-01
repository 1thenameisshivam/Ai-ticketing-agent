import { inngest } from "../clint.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      await step.run("get user by email", async () => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new NonRetriableError("USer not found");
        }
        return user;
      });
      await step.run("send welcome eamil", async () => {
        const subject = "Welcome to Ai-Ticket-Assistant🎉!";
        const text = `👋Hello dear,\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`;
        await sendEmail(email, subject, text);
      });
      return { success: true };
    } catch (error) {
      console.error("❌Error in onUserSignup function:", error.message);
      return { success: false };
      //   throw new Error("Failed to process user signup");
    }
  }
);

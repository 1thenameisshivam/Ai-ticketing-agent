import nodemailer from "nodemailer";
import {
  MAILTRAP_SMTP_HOST,
  MAILTRAP_SMTP_PASS,
  MAILTRAP_SMTP_PORT,
  MAILTRAP_SMTP_USER,
} from "../config/constant";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: MAILTRAP_SMTP_HOST,
      port: MAILTRAP_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: MAILTRAP_SMTP_USER,
        pass: MAILTRAP_SMTP_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: "AI Assistant <INNGEST>",
      to,
      subject,
      text, // plain‑text body
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

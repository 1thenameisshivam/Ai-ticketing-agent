import DotenvFlow from "dotenv-flow";
DotenvFlow.config();

export const {
  MONGO_URI,
  JWT_SECRET,
  PORT,
  MAILTRAP_SMTP_HOST,
  MAILTRAP_SMTP_PORT,
  MAILTRAP_SMTP_USER,
  MAILTRAP_SMTP_PASS,
  GEMINI_API_KEY,
  APP_URL,
  NODE_ENV,
  ARCJET_KEY,
  INNGEST_EVENT_KEY,
  INNGEST_ENV,
  CI,
} = process.env;

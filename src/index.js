import express from "express";
import cors from "cors";
import { PORT } from "./config/constant.js";
import { connectDB } from "./config/dbConnection.js";
import CookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import { inngest } from "./inngest/clint.js";
import { serve } from "inngest/express";
import { onTicketCreated } from "./inngest/functions/onTicketCreated.js";
import { onUserSignup } from "./inngest/functions/onUserSignup.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());

app.get("/health-check", (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tickets", ticketRoutes);

// Inngest event handlers
app.use(
  "/api/v1/inngest",
  serve(inngest, {
    functions: [onTicketCreated, onUserSignup],
  })
);
// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT || 4000, () => {
      console.log(`🚀Server is running on port ${PORT || 4000}`);
    });
  })
  .catch((error) => {
    console.error("❌Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  });

import mongoose from "mongoose";
import { MONGO_URI } from "./constant.js";
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

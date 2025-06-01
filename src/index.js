import express from "express";
import cors from "cors";
import { PORT } from "./config/constant.js";
import { connectDB } from "./config/dbConnection.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health-check", (req, res) => {
  res.status(200).json({ message: "Server is running smoothly!" });
});

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

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constant.js";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("❌JWT verification failed:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

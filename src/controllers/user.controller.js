import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/constant.js";
import { inngest } from "../inngest/clint.js";
import { NODE_ENV } from "../config/constant.js";
import { aj } from "../utils/arcjet.js";
export const userSignup = async (req, res) => {
  try {
    const { email, password, skills } = req.body;
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Check if email is valid
    const decision = await aj.protect(req, { email });
    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        // If the email is invalid then return an error message
        return res
          .status(400)
          .json({ message: "Invalid email or temperory email" });
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      skills: skills || [], // Default to empty array if no skills are provided
    });
    const savedUser = await newUser.save();
    // Trigger Inngest function for user signup
    await inngest.send({
      name: "user/signup",
      data: {
        email: savedUser.email,
      },
    });
    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, role: savedUser.role },
      JWT_SECRET
    );
    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
    });
    // Respond with user data and token
    return res
      .status(201)
      .json({ message: "User created successfully", success: true });
  } catch (error) {
    console.error("❌Error in userSignup:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF attacks
    });
    // Respond with user data and token
    return res.status(200).json({ user, token });
  } catch (error) {
    console.error("❌Error in userLogin:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logOut = (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");
    return res.status(200).json({ message: "✅Logged out successfully" });
  } catch (error) {
    console.error("❌Error in logOut:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email, skills = [], role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update user details
    user.skills = skills.length ? skills : user.skills; // Update skills if provided, otherwise keep existing skills
    user.role = role || user.role; // Update role if provided, otherwise keep existing role
    await user.save();
    // Respond with updated user data
    return res.status(200).json({
      message: "User updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌Error in updateUser:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password from response
    return res.status(200).json({ users });
  } catch (error) {
    console.error("❌Error in getAllUsers:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const myProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId, "-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("❌Error in myProfile:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

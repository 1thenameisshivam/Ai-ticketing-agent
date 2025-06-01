import express from "express";
import {
  getAllUsers,
  logOut,
  myProfile,
  updateUser,
  userLogin,
  userSignup,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { isAuthorize } from "../middleware/isAuthorize.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/logout", isAuthenticated, logOut);
router.get("/me", isAuthenticated, myProfile);
router.get("/allUsers", isAuthenticated, isAuthorize, getAllUsers);
router.patch("/update", isAuthenticated, isAuthorize, updateUser);

export default router;

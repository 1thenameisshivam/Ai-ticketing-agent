import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createTicket,
  getAllTickets,
  getTicket,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllTickets);
router.get("/:ticketId", isAuthenticated, getTicket);
router.post("/", isAuthenticated, createTicket);

export default router;

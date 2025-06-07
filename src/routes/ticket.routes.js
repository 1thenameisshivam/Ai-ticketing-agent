import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  closeTicket,
  createTicket,
  getAllTickets,
  getTicket,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllTickets);
router.get("/:ticketId", isAuthenticated, getTicket);
router.post("/", isAuthenticated, createTicket);
router.patch("/close/:ticketId/", isAuthenticated, closeTicket);

export default router;

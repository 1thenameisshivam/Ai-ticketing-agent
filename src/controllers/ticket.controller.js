import e from "express";
import { inngest } from "../inngest/clint.js";
import Ticket from "../models/ticket.model.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
        success: false,
      });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user.userId, // Assuming req.user is set by authentication middleware
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default deadline is 7 days from now
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id,
      },
    });
    return res.status(201).json({
      message: "Ticket created successfully 🎟️",
      success: true,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("❌Error in createTicket:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { role } = req.user;
    let tickets = [];
    if (role == "admin") {
      tickets = await Ticket.find()
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else if (role == "moderator") {
      tickets = await Ticket.find({ assignedTo: req.user.userId })
        .populate("createdBy", ["email"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: req.user.userId })
        .populate("assignedTo", ["email", "_id"])
        .sort({
          createdAt: -1,
        });
    }
    return res.status(200).json({
      message: "Tickets fetched successfully",
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("❌Error in getAllTickets:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { role } = req.user;
    const { ticketId } = req.params;
    let ticket;
    if (!ticketId) {
      return res.status(400).json({
        message: "Ticket ID is required",
        success: false,
      });
    }
    if (role !== "user") {
      ticket = await Ticket.findById(ticketId).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        _id: ticketId,
        createdBy: req.user.userId,
      }).select("title description status createdAt");
    }
    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Ticket fetched successfully 🎟️",
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("❌Error in getTicket:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

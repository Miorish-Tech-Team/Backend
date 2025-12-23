const UserTicket = require("../../models/ticketModel/userTicketModel");
const User = require("../../models/authModel/userModel");
const {
  sendUserTicketCreationEmail,
  sendUserTicketReplyEmail,
} = require("../../emailService/supportTicketEmail/userSupportEmail");
const { createUserNotification } = require("../notifications/userNotification");

const generateTicketNumber = async () => {
  let exists = true;
  let ticketNumber;

  while (exists) {
    ticketNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existing = await UserTicket.findOne({ where: { ticketNumber } });
    exists = !!existing;
  }

  return ticketNumber;
};

const createUserTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.id;
    const imageUrl = req.fileUrl || null;
    const ticketNumber = await generateTicketNumber();

    const ticket = await UserTicket.create({
      userId,
      subject,
      description,
      image: imageUrl,
      ticketNumber,
    });

    const user = await User.findByPk(userId);

    if (user?.email) {
      await sendUserTicketCreationEmail(
        user.email,
        user.fullName,
        ticketNumber,
        subject
      );
    }

    res
      .status(201)
      .json({ message: "Ticket submitted successfully", ticketNumber, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

const getMyTicketsUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const tickets = await UserTicket.findAll({
      where: { userId },
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "messages",
        "image",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch your tickets" });
  }
};

// User can get tickets by status
const getMyTicketsByStatus = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.params;
  const isAdmin = req.user.role === "admin" || req.user.role === "admin+" || req.user.role === "superadmin";

  try {
    // Validate status
    const validStatuses = ["open", "in_progress", "closed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // If admin, get all tickets with that status, otherwise filter by userId
    const whereCondition = isAdmin ? { status } : { userId, status };
    
    const tickets = await UserTicket.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "messages",
        "image",
        "createdAt",
      ],
      include: isAdmin ? {
        model: User,
        attributes: ["id", "fullName", "email"],
      } : undefined,
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ tickets, count: tickets.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets by status" });
  }
};

const getTicketsByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    const ticket = await UserTicket.findOne({
      where: { id: ticketId },
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "messages",
        "image",
        "createdAt",
        "updatedAt",
      ],
      include: {
        model: User,
        attributes: ["id", "fullName", "email", "phone"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

const getAllTicketsUser = async (req, res) => {
  try {
    const { status } = req.query;
    const whereCondition = status ? { status } : {};
    const tickets = await UserTicket.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "messages",
        "image",
        "createdAt",
      ],
      include: {
        model: User,
        attributes: ["id", "fullName", "email"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ tickets, count: tickets.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

const replyToTicketUser = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply, status, isCrossQuestion } = req.body;
    
    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const ticket = await UserTicket.findByPk(ticketId, {
      include: {
        model: User,
        attributes: ["id", "fullName", "email"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if ticket is closed
    if (ticket.status === "closed") {
      return res.status(403).json({ 
        error: "Cannot reply to a closed ticket. Please open a new ticket if you need further assistance." 
      });
    }

    const originalStatus = ticket.status;

    // Add admin message to conversation thread
    const messages = Array.isArray(ticket.messages) ? [...ticket.messages] : [];
    messages.push({
      sender: "admin",
      message: reply,
      timestamp: new Date().toISOString(),
      isCrossQuestion: isCrossQuestion || false,
    });

    ticket.messages = messages;
    ticket.changed('messages', true); // Mark as changed for Sequelize
    ticket.adminReply = reply; // Keep for backward compatibility
    
    // Update status if provided
    if (status) {
      ticket.status = status;
    }

    await ticket.save();
    const user = ticket.User;

    // Send email notification
    if (user?.email) {
      await sendUserTicketReplyEmail(
        user.email,
        user.fullName,
        ticket.ticketNumber,
        ticket.subject,
        reply,
        ticket.status
      );
    }

    // Create in-app notification
    if (user) {
      let messageParts = [];
      if (isCrossQuestion) {
        messageParts.push("Admin asked a question on your support ticket.");
      } else {
        messageParts.push("Admin replied to your support ticket.");
      }
      if (status && status !== originalStatus) {
        messageParts.push(`Status updated to: ${ticket.status}.`);
      }
      const notificationMessage = messageParts.join(" ");
      if (notificationMessage) {
        await createUserNotification({
          userId: user.id,
          title: "Support Ticket Update",
          message: `${notificationMessage} (Ticket: ${ticket.ticketNumber})`,
          type: "support",
          coverImage: null,
        });
      }
    }

    res.status(200).json({ 
      message: isCrossQuestion 
        ? "Cross-question sent successfully" 
        : "Reply added successfully", 
      ticket 
    });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
};

// Admin can change ticket status
const changeTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["open", "in_progress", "closed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const ticket = await UserTicket.findByPk(ticketId, {
      include: {
        model: User,
        attributes: ["id", "fullName", "email"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    const user = ticket.User;

    // Notify user about status change
    if (user) {
      await createUserNotification({
        userId: user.id,
        title: "Support Ticket Status Updated",
        message: `Your ticket (${ticket.ticketNumber}) status changed from ${oldStatus} to ${status}.`,
        type: "support",
        coverImage: null,
      });
    }

    res.status(200).json({ 
      message: "Ticket status updated successfully", 
      ticket 
    });
  } catch (error) {
    console.error("Error changing ticket status:", error);
    res.status(500).json({ error: "Failed to change ticket status" });
  }
};

// User can reply to admin's message/cross-question
const userReplyToAdmin = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const ticket = await UserTicket.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if ticket is closed - user cannot reply to closed tickets
    if (ticket.status === "closed") {
      return res.status(403).json({ 
        error: "This ticket is closed. You cannot reply anymore. Please create a new ticket if you need further assistance." 
      });
    }

    // Add user message to conversation thread
    const messages = Array.isArray(ticket.messages) ? [...ticket.messages] : [];
    messages.push({
      sender: "user",
      message: reply,
      timestamp: new Date().toISOString(),
      isCrossQuestion: false,
    });

    ticket.messages = messages;
    ticket.changed('messages', true); // Mark as changed for Sequelize
    
    // If ticket was resolved, reopen it when user replies
    if (ticket.status === "resolved") {
      ticket.status = "open";
    }

    await ticket.save();

    res.status(200).json({ 
      message: "Your reply has been sent successfully", 
      ticket 
    });
  } catch (error) {
    console.error("Error user replying to ticket:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
};

module.exports = {
  createUserTicket,
  getMyTicketsUser,
  getMyTicketsByStatus,
  getAllTicketsUser,
  getTicketsByTicketId,
  replyToTicketUser,
  changeTicketStatus,
  userReplyToAdmin,
};

const SellerTicket = require("../../models/ticketModel/sellerTicket");
const Seller = require("../../models/authModel/sellerModel");
const {
  sendSellerTicketReplyEmail,
  sendSellerTicketCreationEmail,
} = require("../../emailService/supportTicketEmail/sellerSupportEmail");

const generateTicketNumber = async () => {
  let exists = true;
  let ticketNumber;

  while (exists) {
    ticketNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existing = await SellerTicket.findOne({ where: { ticketNumber } });
    exists = !!existing;
  }

  return ticketNumber;
};

const createSellerTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userId = req.user.id;
    const imageUrl = req.fileUrl || null;
    const ticketNumber = await generateTicketNumber();

    const seller = await Seller.findOne({ where: { userId } });

    if (!seller) {
      return res.status(404).json({ error: "Seller account not found for this user" });
    }

    const ticket = await SellerTicket.create({
      sellerId: seller.id,
      subject,
      description,
      image: imageUrl,
      ticketNumber,
    });

    if (seller?.email) {
      await sendSellerTicketCreationEmail(
        seller.email,
        seller.sellerName,
        ticketNumber,
        subject
      );
    }

    res.status(201).json({
      success: true,
      message: "Ticket submitted successfully",
      ticketNumber,
      ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

const getMyTicketsSeller = async (req, res) => {
  const userId = req.user.id;
  try {
    const seller = await Seller.findOne({ where: { userId } });
    if (!seller) {
      return res.status(404).json({ error: "Seller account not found" });
    }

    const tickets = await SellerTicket.findAll({
      where: { sellerId: seller.id },
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
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch your tickets" });
  }
};

// Seller can get tickets by status
const getSellerTicketsByStatus = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.params;
  const isAdmin = req.user.role === "admin" || req.user.role === "admin+" || req.user.role === "superadmin";

  try {
    // Validate status
    const validStatuses = ["open", "in_progress", "closed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    let whereCondition;
    if (isAdmin) {
      // Admin can see all tickets with that status
      whereCondition = { status };
    } else {
      // Seller can only see their own tickets
      const seller = await Seller.findOne({ where: { userId } });
      if (!seller) {
        return res.status(404).json({ error: "Seller account not found" });
      }
      whereCondition = { sellerId: seller.id, status };
    }
    
    const tickets = await SellerTicket.findAll({
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
        model: Seller,
        attributes: ["id", "sellerName", "email", "contactNumber"],
      } : undefined,
      order: [["createdAt", "DESC"]],
    });
    
    res.status(200).json({ success: true, tickets, count: tickets.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets by status" });
  }
};

const getAllTicketsSeller = async (req, res) => {
  try {
    const tickets = await SellerTicket.findAll({
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
        model: Seller,
        attributes: ["id", "sellerName", "email", "contactNumber"],
      },
      order: [["createdAt", "DESC"]],
    });
    const count = tickets.length;
    res.status(200).json({ success: true, tickets, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

const getTicketByIdSeller = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }
     
    const ticket = await SellerTicket.findOne({
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
        model: Seller,
        attributes: ["id", "sellerName", "email", "contactNumber"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error fetching seller ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

// Admin can reply to seller ticket
const replyToTicketSeller = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply, status, isCrossQuestion = false } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const ticket = await SellerTicket.findByPk(ticketId, {
      include: {
        model: Seller,
        attributes: ["id", "sellerName", "email", "contactNumber"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if ticket is closed
    if (ticket.status === "closed") {
      return res.status(403).json({ 
        error: "Cannot reply to a closed ticket." 
      });
    }

    const originalStatus = ticket.status;

    // Add admin message to conversation thread
    const messages = Array.isArray(ticket.messages) ? [...ticket.messages] : [];
    messages.push({
      sender: "admin",
      message: reply,
      timestamp: new Date().toISOString(),
      isCrossQuestion: !!isCrossQuestion,
    });

    ticket.messages = messages;
    ticket.adminReply = reply; // Keep for backward compatibility
    ticket.changed('messages', true); // Mark as changed for Sequelize
    
    if (status) {
      ticket.status = status;
    }
    
    await ticket.save();

    const seller = ticket.Seller;
    if (seller?.email) {
      await sendSellerTicketReplyEmail(
        seller.email,
        seller.sellerName,
        ticket.ticketNumber,
        ticket.subject,
        reply,
        ticket.status
      );
    }

    res.status(200).json({ 
      success: true,
      message: isCrossQuestion 
        ? "Cross-question sent successfully" 
        : "Reply added successfully", 
      ticket 
    });
  } catch (error) {
    console.error("Error replying to seller ticket:", error);
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
};

// Admin can change seller ticket status
const changeSellerTicketStatus = async (req, res) => {
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

    const ticket = await SellerTicket.findByPk(ticketId, {
      include: {
        model: Seller,
        attributes: ["id", "sellerName", "email"],
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    res.status(200).json({ 
      success: true,
      message: "Ticket status updated successfully", 
      ticket,
      oldStatus,
      newStatus: status
    });
  } catch (error) {
    console.error("Error changing seller ticket status:", error);
    res.status(500).json({ error: "Failed to change ticket status" });
  }
};

// Seller can reply to admin's message/cross-question
const sellerReplyToAdmin = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const seller = await Seller.findOne({ where: { userId } });
    if (!seller) {
      return res.status(404).json({ error: "Seller account not found" });
    }

    const ticket = await SellerTicket.findOne({
      where: { id: ticketId, sellerId: seller.id },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if ticket is closed - seller cannot reply to closed tickets
    if (ticket.status === "closed") {
      return res.status(403).json({ 
        error: "This ticket is closed. You cannot reply anymore. Please create a new ticket if you need further assistance." 
      });
    }

    // Add seller message to conversation thread
    const messages = Array.isArray(ticket.messages) ? [...ticket.messages] : [];
    messages.push({
      sender: "seller",
      message: reply,
      timestamp: new Date().toISOString(),
      isCrossQuestion: false,
    });

    ticket.messages = messages;
    ticket.changed('messages', true); // Mark as changed for Sequelize
    
    // If ticket was resolved, reopen it when seller replies
    if (ticket.status === "resolved") {
      ticket.status = "open";
    }

    await ticket.save();

    res.status(200).json({ 
      success: true,
      message: "Your reply has been sent successfully", 
      ticket 
    });
  } catch (error) {
    console.error("Error seller replying to ticket:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
};

module.exports = {
  createSellerTicket,
  getMyTicketsSeller,
  getSellerTicketsByStatus,
  getAllTicketsSeller,
  getTicketByIdSeller,
  replyToTicketSeller,
  changeSellerTicketStatus,
  sellerReplyToAdmin,
};

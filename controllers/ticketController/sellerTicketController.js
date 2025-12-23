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
    const image = req.file;
    const imageUrl = image?.location || null;

  
    const seller = await Seller.findOne({ where: { userId } });

    if (!seller) {
      return res.status(404).json({ error: "Seller account not found for this user" });
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await SellerTicket.create({
      sellerId: seller.id,
      subject,
      description,
       imageUrl,
      ticketNumber,
    });

    if (seller?.email) {
      await sendSellerTicketCreationEmail(
        seller.email,
        `${seller.firstName} ${seller.lastName}`,
        ticketNumber,
        subject
      );
    }

    res.status(201).json({
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
  try {
    const tickets = await SellerTicket.findAll({
      where: { sellerId: req.seller.id },
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
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

const getAllTicketsSeller = async (req, res) => {
  try {
    const { status } = req.query;
    const whereCondition = status ? { status } : {};
    const tickets = await SellerTicket.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "imageUrl",
        "createdAt",
      ],
      include: {
        model: Seller,
        attributes: ["id", "sellerName", "email","contactNumber"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ tickets });
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
      where: {id:ticketId },
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "imageUrl",
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

    res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching seller ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};


const replyToTicketSeller = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminReply, status } = req.body;

    if (!adminReply || adminReply.trim() === "") {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const ticket = await SellerTicket.findByPk(ticketId, {
      include: {
        model: Seller,
        attributes: ["sellerName", "email","contactNumber"],
      },
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Check if ticket is closed
    if (ticket.status === "closed") {
      return res.status(403).json({ 
        error: "Cannot reply to a closed ticket." 
      });
    }

    ticket.adminReply = adminReply;
    if (status) {
      ticket.status = status;
    }
    await ticket.save();

    const seller = ticket.Seller;
    if (seller?.email) {
      await sendSellerTicketReplyEmail(
        seller.email,
        `${seller.sellerName}`,
        ticket.ticketNumber,
        ticket.subject,
        ticket.adminReply,
        ticket.status
      );
    }

    res.status(200).json({ message: "Reply added successfully", ticket });
  } catch (error) {
      console.error("Error replying to seller ticket:", error);
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
};

// Get seller tickets by status (Admin only)
const getSellerTicketsByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    // Validate status
    const validStatuses = ["open", "in_progress", "closed", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const tickets = await SellerTicket.findAll({
      where: { status },
      attributes: [
        "id",
        "ticketNumber",
        "subject",
        "description",
        "status",
        "adminReply",
        "imageUrl",
        "createdAt",
      ],
      include: {
        model: Seller,
        attributes: ["id", "sellerName", "email", "contactNumber"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ tickets, count: tickets.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tickets by status" });
  }
};

// Change seller ticket status (Admin only)
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

module.exports = {
  createSellerTicket,
  getMyTicketsSeller,
  getAllTicketsSeller,
  replyToTicketSeller,
  getTicketByIdSeller,
  getSellerTicketsByStatus,
  changeSellerTicketStatus,
};

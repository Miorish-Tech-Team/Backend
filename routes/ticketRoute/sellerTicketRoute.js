const express = require("express");
const router = express.Router();
const checkForAuthenticationCookie = require("../../authMiddleware/authMiddleware");
const { authorizeRoles } = require("../../authMiddleware/roleMiddleware");
const { 
  replyToTicketSeller, 
  getAllTicketsSeller, 
  getMyTicketsSeller, 
  createSellerTicket, 
  getTicketByIdSeller,
  getSellerTicketsByStatus,
  changeSellerTicketStatus,
  sellerReplyToAdmin
} = require("../../controllers/ticketController/sellerTicketController");
const upload = require('../../config/uploadComfig/upload')

// Seller routes
router.post(
  "/seller/raise-ticket",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["seller"]),
  ...upload.single('image'),
  createSellerTicket
);

router.get(
  "/seller/my-tickets", 
  checkForAuthenticationCookie("token"),  
  authorizeRoles(["seller"]), 
  getMyTicketsSeller
);

// Seller can get tickets by status (open, in_progress, closed, resolved)
router.get(
  "/seller/my-tickets/status/:status",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["seller"]),
  getSellerTicketsByStatus
);

// Seller can get a specific ticket by ID
router.get(
  "/seller/my-tickets/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["seller"]),
  getTicketByIdSeller
);

// Seller can reply to admin's message or cross-question
router.post(
  "/seller/reply/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["seller"]),
  sellerReplyToAdmin
);

// Admin routes
router.get(
  "/seller/admin/all-tickets",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getAllTicketsSeller
);

// Admin can get seller tickets by status
router.get(
  "/seller/admin/tickets/status/:status",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getSellerTicketsByStatus
);

router.get(
  "/seller/admin/all-tickets/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getTicketByIdSeller
);

// Admin can reply to ticket (can include cross-question flag)
router.post(
  "/seller/admin/reply/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  replyToTicketSeller
);

// Admin can change seller ticket status
router.put(
  "/seller/admin/change-status/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  changeSellerTicketStatus
);

module.exports = router;

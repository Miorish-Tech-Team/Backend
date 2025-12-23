const express = require("express");
const router = express.Router();
const checkForAuthenticationCookie = require("../../authMiddleware/authMiddleware");
const { authorizeRoles } = require("../../authMiddleware/roleMiddleware");
const {
  createUserTicket,
  getMyTicketsUser,
  getMyTicketsByStatus,
  getAllTicketsUser,
  getTicketsByTicketId,
  replyToTicketUser,
  changeTicketStatus,
  userReplyToAdmin,
} = require("../../controllers/ticketController/userTicketController");
const upload = require('../../config/uploadComfig/upload')

// User routes
router.post(
  "/user/raise-ticket",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["user"]),
  ...upload.single("image"),
  createUserTicket
);

router.get(
  "/user/my-tickets",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["user"]),
  getMyTicketsUser
);

// User can get tickets by status (open, in_progress, closed, resolved)
router.get(
  "/user/my-tickets/status/:status",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["user"]),
  getMyTicketsByStatus
);

// User can reply to admin's message or cross-question
router.post(
  "/user/reply/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["user"]),
  userReplyToAdmin
);

// Admin routes
router.get(
  "/user/admin/all-tickets",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getAllTicketsUser
);

// Admin can get tickets by status
router.get(
  "/user/admin/tickets/status/:status",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getMyTicketsByStatus
);

router.get(
  "/user/admin/all-tickets/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  getTicketsByTicketId
);

// Admin can reply to ticket (can include cross-question flag)
router.post(
  "/user/admin/reply/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  replyToTicketUser
);

// Admin can change ticket status
router.put(
  "/user/admin/change-status/:ticketId",
  checkForAuthenticationCookie("token"),
  authorizeRoles(["admin", "admin+", "superadmin"]),
  changeTicketStatus
);

module.exports = router;

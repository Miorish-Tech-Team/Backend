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
  changeSellerTicketStatus
} = require("../../controllers/ticketController/sellerTicketController");
const upload = require('../../config/uploadComfig/upload')



router.post(
  "/seller/raise-ticket",
  checkForAuthenticationCookie("token"),
    authorizeRoles(["seller"]),
  upload.single('imageUrl'),
  createSellerTicket
);


router.get("/seller/my-tickets", checkForAuthenticationCookie("token"),  authorizeRoles(["seller"]), getMyTicketsSeller);


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

router.put(
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

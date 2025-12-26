const express = require("express");
const { handleAssignMembershipToSeller, handleRenewSellerMembership, handleGetAllMemberships, handleGetMembershipById, getSellerMembershipStatus } = require("../../../controllers/membershipController/sellerMembership");
const { createRazorpayOrderForMembership, verifyAndActivateMembership } = require("../../../controllers/membershipController/razorpayMembershipController");

const router = express.Router();
router.get('/membership-status',getSellerMembershipStatus);
router.get('/memberships', handleGetAllMemberships);
router.get('/memberships/:membershipId',handleGetMembershipById);
router.patch('/memberships/:membershipId/assign-membership',handleAssignMembershipToSeller);
router.patch('/memberships/:membershipId/renew-membership',  handleRenewSellerMembership);

// Razorpay payment routes for membership
router.post('/memberships/:membershipId/create-razorpay-order', createRazorpayOrderForMembership);
router.post('/memberships/verify-payment', verifyAndActivateMembership);

module.exports = router;
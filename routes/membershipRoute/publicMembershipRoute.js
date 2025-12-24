const express = require("express");
const { handleGetAllMemberships } = require("../../controllers/membershipController/sellerMembership");

const router = express.Router();

// Public route to get all active memberships
router.get('/memberships', handleGetAllMemberships);

module.exports = router;

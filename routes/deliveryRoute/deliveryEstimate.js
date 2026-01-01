const express = require("express");
const router = express.Router();
const {
  getDeliveryEstimate,
  clearDeliveryCache,
} = require("../../controllers/deliveryController/deliveryEstimation");

// POST /api/user/delivery/estimate - Get delivery estimate
router.post("/estimate", getDeliveryEstimate);

// POST /api/admin/delivery/clear-cache - Clear delivery cache (admin only)
router.post("/clear-cache", clearDeliveryCache);

module.exports = router;

const express = require("express");
const { getEstimateForProductFromGoogle, getEstimateForProductFromOSRM } = require("../../controllers/deliveryController/userDelivery");
const { getDeliveryEstimate, clearDeliveryCache } = require("../../controllers/deliveryController/deliveryEstimation");

const router = express.Router();

//router.get("/estimate/:productId", getEstimateForProductFromGoogle);
router.get("/estimate/:productId", getEstimateForProductFromOSRM);

// New delivery estimation endpoint
router.post("/delivery-estimate", getDeliveryEstimate);

module.exports = router;

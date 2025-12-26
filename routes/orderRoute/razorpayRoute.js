const express = require("express");
const {
  createRazorpayOrderForBuyNow,
  createRazorpayOrderForCart,
  verifyAndCompleteBuyNowOrder,
  verifyAndCompleteCartOrder,
} = require("../../controllers/orderController/razorpayController");

const router = express.Router();

// Create Razorpay order for Buy Now
router.post("/buy-now/create-order", createRazorpayOrderForBuyNow);

// Verify and complete Buy Now order
router.post("/buy-now/verify", verifyAndCompleteBuyNowOrder);

// Create Razorpay order for Cart
router.post("/cart/create-order", createRazorpayOrderForCart);

// Verify and complete Cart order
router.post("/cart/verify", verifyAndCompleteCartOrder);

module.exports = router;

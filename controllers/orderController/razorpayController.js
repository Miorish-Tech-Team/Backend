const Razorpay = require("razorpay");
const crypto = require("crypto");
const { handleBuyNow, handlePlaceOrderFromCart } = require("./orderController");
const Address = require("../../models/orderModel/orderAddressModel");
const Product = require("../../models/productModel/productModel");
const Cart = require("../../models/cartModel/cartModel");
const CartItem = require("../../models/cartModel/cartItemModel");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order for Buy Now
 */
const createRazorpayOrderForBuyNow = async (req, res) => {
  const { productId, quantity, addressId } = req.body;
  const userId = req.user.id;

  try {
    // Validate product and address
    const product = await Product.findByPk(productId);
    const address = await Address.findOne({ where: { id: addressId, userId } });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (product.availableStockQuantity < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available" });
    }

    // Calculate amount
    const amount = product.productPrice * quantity * 100; // Convert to paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}_${userId}`,
      notes: {
        userId: userId.toString(),
        productId: productId.toString(),
        quantity: quantity.toString(),
        addressId: addressId.toString(),
        orderType: "buynow",
      },
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

/**
 * Create Razorpay order for Cart checkout
 */
const createRazorpayOrderForCart = async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user.id;

  try {
    // Validate address
    const address = await Address.findOne({ where: { id: addressId, userId } });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Get cart and cart items
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product }],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.Product.productPrice * item.quantity;
    }

    const amount = totalAmount * 100; // Convert to paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `cart_${Date.now()}_${userId}`,
      notes: {
        userId: userId.toString(),
        addressId: addressId.toString(),
        cartId: cart.id.toString(),
        orderType: "cart",
      },
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay cart order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order for cart",
      error: error.message,
    });
  }
};

/**
 * Verify Razorpay payment and complete Buy Now order
 */
const verifyAndCompleteBuyNowOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    productId,
    quantity,
    addressId,
  } = req.body;

  const userId = req.user.id;

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Payment verified successfully, create order
    req.body = {
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      addressId: parseInt(addressId),
      paymentMethod: "Razorpay",
    };

    return await handleBuyNow(req, res);
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/**
 * Verify Razorpay payment and complete Cart order
 */
const verifyAndCompleteCartOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    addressId,
  } = req.body;

  const userId = req.user.id;

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Payment verified successfully, create order
    req.body = {
      addressId: parseInt(addressId),
      paymentMethod: "Razorpay",
    };

    return await handlePlaceOrderFromCart(req, res);
  } catch (error) {
    console.error("Cart payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrderForBuyNow,
  createRazorpayOrderForCart,
  verifyAndCompleteBuyNowOrder,
  verifyAndCompleteCartOrder,
};

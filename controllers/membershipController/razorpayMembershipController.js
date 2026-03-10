const Razorpay = require("razorpay");
const crypto = require("crypto");
const Seller = require("../../models/authModel/sellerModel");
const Membership = require("../../models/membershipModel/sellerMembershipModel");
const {
  sendMembershipAssignedEmail,
} = require("../../emailService/sellerMembershipEmail/sellerMembershipEmail");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



// Create Razorpay order for membership purchase
const createRazorpayOrderForMembership = async (req, res) => {
  try {
   
    const { membershipId } = req.params;
    const userId = req.user.id;
   

    // Find seller
    const seller = await Seller.findOne({ where: { userId } });
    if (!seller) {
      console.error("Seller not found for userId:", userId);
      return res.status(404).json({ message: "Seller not found" });
    }
    

    // Find membership plan
    const membership = await Membership.findByPk(membershipId);
    if (!membership) {
      
      return res.status(404).json({ message: "Membership plan not found" });
    }
   

    if (!membership.isActive) {
      return res.status(400).json({ message: "Membership plan is not active" });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(membership.price * 100), // Convert to paise
      currency: "INR",
      receipt: `membership_${seller.id}_${Date.now()}`,
      notes: {
        sellerId: seller.id,
        membershipId: membership.id,
        planName: membership.planName,
        durationInDays: membership.durationInDays,
      },
    };

  
    const razorpayOrder = await razorpay.orders.create(options);
   

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      membership: {
        id: membership.id,
        planName: membership.planName,
        price: membership.price,
        durationInDays: membership.durationInDays,
        description: membership.description,
      },
    });
  } catch (error) {
    console.error("Error creating Razorpay order for membership:", error);
  
    res.status(500).json({
      message: "Error creating payment order",
      error: error.message,
    });
  }
};

// Verify payment and activate membership
const verifyAndActivateMembership = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      membershipId,
    } = req.body;

    const userId = req.user.id;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Find seller
    const seller = await Seller.findOne({ where: { userId } });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Find membership plan
    const membership = await Membership.findByPk(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership plan not found" });
    }

    // Calculate membership dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(membership.durationInDays));

    // Update seller membership
    seller.membershipId = membership.id;
    seller.membershipStart = startDate;
    seller.membershipEnd = endDate;
    await seller.save();

    // Send confirmation email
    try {
      await sendMembershipAssignedEmail(
        seller.email,
        seller.sellerName,
        membership.planName,
        startDate,
        endDate
      );
    } catch (emailError) {
      console.error("Error sending membership email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Membership activated successfully",
      membership: {
        planName: membership.planName,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error verifying and activating membership:", error);
    res.status(500).json({
      message: "Error activating membership",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrderForMembership,
  verifyAndActivateMembership,
};

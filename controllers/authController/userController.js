const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { Op } = require("sequelize");
const speakeasy = require("speakeasy");
const setTokenCookie = require("../../authService/setTokenCookie");
const clearTokenCookie = require("../../authService/clearCookie");
const User = require("../../models/authModel/userModel");
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendForgetPasswordURL,
  sendRecoveryEmail,
  sendTwoFactorOtp,
} = require("../../emailService/userAuthEmail/userAuthEmail");
const { createToken, createMiddlewareToken } = require("../../authService/authService");
const { updateCustomers } = require("../statistics/adminStats");
const { createUserNotification } = require("../notifications/userNotification");
const UserCoupon = require("../../models/couponModel/userCouponModel");
const Coupon = require("../../models/couponModel/couponModel");

const handleSignUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      if (!existingUser.password) {
        return res.status(400).json({
          message:
            "You signed up with Google. Please log in with Google or reset your password.",
        });
      }
      return res.status(400).json({ message: "Email already registered" });
    }
    // const verificationCode = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    // const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      isTwoFactorAuthEnable: false,
    });

    const now = new Date();
    const welcomeCoupon = await Coupon.findOne({
      where: {
        autoAssignOnSignup: true,
        isActive: true,
        validFrom: { [Op.lte]: now },
        validTill: { [Op.gte]: now },
      },
    });

    if (welcomeCoupon) {
      await UserCoupon.create({
        userId: newUser.id,
        couponId: welcomeCoupon.id,
        used: false,
      });

      await createUserNotification({
        userId: newUser.id,
        title: " Welcome Coupon Assigned!",
        message: `You've received a welcome coupon "${
          welcomeCoupon.code
        }" worth ₹${
          welcomeCoupon.discountAmount || welcomeCoupon.discountPercentage + "%"
        }!`,
        type: "coupon",
        coverImage: null,
      });
    }

    await updateCustomers();
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Signup failed", error: error.message });
  }
};








const handleSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If 2FA is enabled, send OTP
    if (user.isTwoFactorAuthEnable) {
      // Check if using email or authenticator method
      if (user.twoFactorMethod === "authenticator") {
        // For authenticator, just indicate that 2FA is required
        return res.status(202).json({
          success: true,
          message: "Please enter the code from your authenticator app.",
          isTwoFactorAuthEnable: user.isTwoFactorAuthEnable,
          twoFactorMethod: "authenticator",
          userId: user.id
        });
      } else {
        // For email method, send OTP
        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.verificationCode = verificationCode;
        user.verificationCodeExpiresAt = verificationCodeExpiresAt;
        await user.save();

        await sendTwoFactorOtp(user.email, user.fullName, verificationCode);
        console.log("Sent 2FA OTP:", verificationCode, verificationCodeExpiresAt);
        return res.status(202).json({
          success: true,
          message: "OTP sent to your email. Please verify to complete login.",
          isTwoFactorAuthEnable: user.isTwoFactorAuthEnable,
          twoFactorMethod: "email"
        });
      }
    }

    // If no 2FA, log user in
    const token = createToken(user);
    const middlewareToken = createMiddlewareToken(user);

    setTokenCookie(res, token, middlewareToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

const verify2FALogin = async (req, res) => {
  try {
    const { verificationCode, userId } = req.body;

    console.log("Received 2FA verification code:", verificationCode);
    
    // First try to find user by verification code (email method)
    let user = await User.findOne({
      where: {
        verificationCode: verificationCode,
        verificationCodeExpiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    // If not found, try authenticator method
    if (!user && userId) {
      user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify TOTP code for authenticator
      if (user.twoFactorMethod === "authenticator" && user.twoFactorSecret) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: verificationCode,
          window: 2
        });

        if (!verified) {
          console.log("Invalid authenticator code.");
          return res.status(400).json({
            success: false,
            message: "Invalid authentication code",
          });
        }
        
        console.log("Authenticator code verified for user:", user.email);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }
    }

    if (!user) {
      console.log("Invalid or expired verification code.");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    console.log("User verified:", user.email);

    // Clear verification code for email method
    if (user.twoFactorMethod === "email") {
      user.verificationCode = null;
      user.verificationCodeExpiresAt = null;
      await user.save();
      console.log("Verification fields cleared.");
    }

    const token = createToken(user);
    const middlewareToken = createMiddlewareToken(user);
    console.log("JWT token created:", token);

    setTokenCookie(res, token, middlewareToken);
    console.log("Token cookie set successfully.");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("2FA verification error:", error.message);
    return res
      .status(500)
      .json({ message: "2FA verification failed", error: error.message });
  }
};

const handleLogout = (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
};
const handleFindMyAccountPasswordURL = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = JWT.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const resetLink = `${process.env.FRONTEND_URL_MAIN}/auth/set-password/${resetToken}`;
    await sendForgetPasswordURL(user.email, resetLink);

    return res
      .status(200)
      .json({ message: "reset link sent to email", resetLink });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

const handleUserResetPasswordFromUrl = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    const decoded = JWT.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await sendRecoveryEmail(user.email, user.fullName);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};


module.exports = {
  handleSignUp,
  handleSignin,
  handleLogout,
  handleFindMyAccountPasswordURL,
  handleUserResetPasswordFromUrl,
  verify2FALogin,
};

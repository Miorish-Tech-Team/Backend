const express = require("express");
const router = express.Router();
const {
  handleSignUp,
  handleSignin,
  handleLogout,
  handleFindMyAccountPasswordURL,

  handleUserResetPasswordFromUrl,
  handleUserResetPasswordFromOtp,
  verify2FALogin,
} = require("../../controllers/authController/userController");

router.post("/signup", handleSignUp);
router.post("/signin", handleSignin);
router.post("/logout", handleLogout);

router.post("/find-my-account", handleFindMyAccountPasswordURL);
router.post("/find-my-account/:resetToken", handleUserResetPasswordFromUrl);
router.patch('/verify-two-factor',  verify2FALogin);

module.exports = router;

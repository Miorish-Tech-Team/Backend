const express = require("express");
const upload = require("../../../config/uploadComfig/upload");
const { createAdminNotification } = require("../../../controllers/notifications/adminsNotification");
const router = express.Router();

router.post(
  "/add-notifications",
  ...upload.single("coverImage"),
  createAdminNotification
);
module.exports = router;

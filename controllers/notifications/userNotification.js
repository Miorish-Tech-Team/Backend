const { Op } = require("sequelize");
const Notification = require("../../models/notifications/userNotification");
const createUserNotification = async ({ title, message, userId, type, coverImage }) => {
  try {
    if (!title || !message || !userId) return;
    await Notification.create({
      title,
      message,
      type,
      userId,
      coverImage,
    });
  } catch (err) {
    console.error("Auto user notification error:", err);
  }
};



module.exports = {
    createUserNotification,
    
}
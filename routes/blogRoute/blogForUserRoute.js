const express = require("express");
const {
  getAllBlogs,
  getBlogById,
} = require("../../controllers/blogController/blogController");

const router = express.Router();
router.get("/all", getAllBlogs);
router.get("/:id", getBlogById);

module.exports = router;
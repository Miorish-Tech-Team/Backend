const express = require("express");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
} = require("../../controllers/blogController/blogController");
const upload = require("../../config/uploadComfig/upload");

const router = express.Router();

// Admin routes - for managing blogs
router.post("/create", ...upload.single("image"), createBlog);
router.put("/update/:id", ...upload.single("image"), updateBlog);
router.delete("/delete/:id", deleteBlog);
router.get("/all", getAllBlogs);
router.get("/:id", getBlogById);

module.exports = router;
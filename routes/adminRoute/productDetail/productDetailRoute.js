const express = require("express");
const {
  getAllProducts,
  getProductById,
  getProductCount,
  getProductStats,
  getProductsByStatus,
} = require("../../../controllers/adminController/productDetail/productDetail");
const upload = require("../../../config/uploadComfig/upload");
const {
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  handleBulkDeleteProducts,
  getMyProducts,
  getMyProductById,
  getMyProductsByStatus,
  getMyProductCount,
} = require("../../../controllers/productController/productController");
const router = express.Router();

// Admin product management routes
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/products-count", getProductCount);
router.get("/products-stats", getProductStats);
router.get("/products/status/:status", getProductsByStatus);

// admin's product details routes
router.get("/my-products", getMyProducts);
router.get("/my-products/count", getMyProductCount);
router.get("/my-products/status/:status", getMyProductsByStatus);
router.get("/my-products/:productId", getMyProductById);

// Product CRUD routes
router.post("/add-products", ...upload.single("coverImageUrl"), handleAddProduct);
router.put(
  "/update-product/:productId",
  ...upload.fields([{ name: 'coverImageUrl', maxCount: 1 }, { name: 'galleryImageUrls', maxCount: 5 }]),
  handleUpdateProduct
);
router.delete("/delete-product/:productId",  handleDeleteProduct);
router.post("/delete-products-bulk", handleBulkDeleteProducts);

module.exports = router;

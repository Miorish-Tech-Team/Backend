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
} = require("../../../controllers/productController/productController");
const router = express.Router();

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/products-count", getProductCount);
router.get("/products-stats", getProductStats);
router.get("/products/status/:status", getProductsByStatus);
router.post("/add-products", ...upload.single("coverImageUrl"), handleAddProduct);
router.put(
  "/update-product/:productId",
  ...upload.array("galleryImageUrls", 5),
  handleUpdateProduct
);
router.delete("/delete-product/:productId",  handleDeleteProduct);
router.post("/delete-products-bulk", handleBulkDeleteProducts);

module.exports = router;

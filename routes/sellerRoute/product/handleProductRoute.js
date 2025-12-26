const express = require("express");
const {
  handleAddProduct,
  handleUpdateProduct,
  handleDeleteProduct,
  getMyProducts,
  getMyProductById,
  getMyProductsByStatus,
  getMyProductCount,
} = require("../../../controllers/productController/productController");
const upload = require("../../../config/uploadComfig/upload");
const checkSellerMembership = require("../../../membershipMiddleware/sellerMembership");
const router = express.Router();

// Get routes
router.get("/my-products", getMyProducts);
router.get("/my-products/count", getMyProductCount);
router.get("/my-products/status/:status", getMyProductsByStatus);
router.get("/my-products/:productId", getMyProductById);

// Create/Update/Delete routes
router.post(
  "/add-products",
  checkSellerMembership,
  ...upload.single("coverImageUrl"),
  handleAddProduct
);
router.put(
  "/update-product/:productId",
  checkSellerMembership,
  ...upload.fields([
    { name: "coverImageUrl", maxCount: 1 },
    { name: "galleryImageUrls", maxCount: 5 },
    { name: "productVideoUrl", maxCount: 1 },
  ]),
  handleUpdateProduct
);
router.delete("/delete-product", checkSellerMembership, handleDeleteProduct);

module.exports = router;

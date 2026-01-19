const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../../authMiddleware/roleMiddleware");
const {
  handleDeleteUserReviewByAdmin,
  handleDeleteReviewByUser,
  handleUpdateReview,
  handleAddReview,
  handleGetUserReviewsWithProducts,
} = require("../../controllers/reviewController/reviewController");
const hasPurchasedProduct = require("../../ReviewMiddleware/hasPurchasedProduct");
const canReviewProduct = require("../../ReviewMiddleware/canReviewProduct");
const upload = require('../../config/uploadComfig/upload')

router.post(
  "/review/add",
  ...upload.single("reviewPhoto"),
  hasPurchasedProduct,
 canReviewProduct,
  handleAddReview
);

router.put(
  "/review/:reviewId",
   ...upload.single("reviewPhoto"),
  handleUpdateReview
);

router.delete(
  "/review/:reviewId",
  handleDeleteReviewByUser
);
router.get("/my-reviews", handleGetUserReviewsWithProducts);


module.exports = router;

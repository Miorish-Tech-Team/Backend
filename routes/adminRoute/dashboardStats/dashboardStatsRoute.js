const express = require("express");
const {
  getCustomersCount,
  getSellersCount,
  getProductsCount,
  getAllDashboardStats,
} = require("../../../controllers/adminController/dashboardStats/dashboardStats");

const router = express.Router();

router.get("/customers-count", getCustomersCount);
router.get("/sellers-count", getSellersCount);
router.get("/products-count", getProductsCount);
router.get("/stats", getAllDashboardStats);

module.exports = router;

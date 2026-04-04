const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRevenueStats,
  getTopProducts
} = require("../controllers/dashboardController");

router.get("/seller/dashboard/stats/:sellerId", getDashboardStats);

router.get("/seller/dashboard/revenue/:sellerId", getRevenueStats);

router.get("/seller/dashboard/top-products/:sellerId", getTopProducts);

module.exports = router;
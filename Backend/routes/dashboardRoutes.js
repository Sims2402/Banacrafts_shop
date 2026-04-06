import express from "express";
const router = express.Router();

import {
  getDashboardStats,
  getRevenueStats,
  getTopProducts
} from "../controllers/dashboardController.js";

router.get("/seller/dashboard/stats/:sellerId", getDashboardStats);

router.get("/seller/dashboard/revenue/:sellerId", getRevenueStats);

router.get("/seller/dashboard/top-products/:sellerId", getTopProducts);

export default router;
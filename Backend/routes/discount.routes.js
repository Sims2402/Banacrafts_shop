import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createDiscount,
  getDiscounts,
  getSellerDiscounts,
  updateDiscount,
  deleteDiscount,
  toggleDiscount
} from "../controllers/discount.controller.js";

const router = express.Router();

// ================= ADMIN =================
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getDiscounts
);

// ================= CREATE =================
router.post(
  "/",
  protect,
  authorizeRoles("admin", "seller"),
  createDiscount
);

// ================= SELLER =================
// 🔥 NO sellerId needed — comes from token
router.get(
  "/seller/me",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerDiscounts
);

// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "seller"),
  updateDiscount
);

// ================= TOGGLE =================
router.patch(
  "/:id/toggle",
  protect,
  authorizeRoles("admin", "seller"),
  toggleDiscount
);

// ================= DELETE =================
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "seller"),
  deleteDiscount
);

export default router;
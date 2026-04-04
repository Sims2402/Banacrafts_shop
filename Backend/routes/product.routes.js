import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  submitProductRating
} from "../controllers/product.controller.js";

import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// ================= PUBLIC =================
router.get("/", getAllProducts);

// ⚠️ IMPORTANT: specific routes FIRST
router.get(
  "/seller/me",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerProducts
);
router.get(
  "/seller/:sellerId",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerProducts  // controller must use req.params.sellerId
);

// ================= SINGLE =================
router.get("/:id", getProductById);

// ================= CREATE =================
router.post(
  "/",
  protect,
  authorizeRoles("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  authorizeRoles("seller", "admin"),
  updateProduct
);

// ================= DELETE =================
router.delete(
  "/:id",
  protect,
  authorizeRoles("seller", "admin"),
  deleteProduct
);

// ================= RATING =================
router.post("/:id/rate", protect, submitProductRating);

export default router;
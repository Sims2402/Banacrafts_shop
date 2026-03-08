import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getSellerProducts
} from "../controllers/product.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();
/* Public - Get all products */
router.get("/", getAllProducts);
/* Seller/Admin - Get own products */
router.get(
  "/seller/me",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerProducts
);

/* Public - Get product by ID */
router.get("/:id", getProductById);

/* Create Product (Seller/Admin) */
router.post(
  "/",
  protect,
  authorizeRoles("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

export default router;

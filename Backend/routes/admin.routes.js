import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  getDashboardData,

  // Discounts
  getAllDiscounts,
  createDiscount,
  toggleDiscountStatus,
  deleteDiscount,

  // Users
  getAllUsers,
  createUserByAdmin,
  deleteUser,

  // Orders
  getAllOrdersAdmin,

  // Awareness
  getAllArticles,
  createArticle,
  deleteArticle,
  updateArticle,
  getSingleArticle

} from "../controllers/admin.controller.js";

const router = express.Router();

/* =====================================================
   DASHBOARD
===================================================== */

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardData
);


/* =====================================================
   USER MANAGEMENT
===================================================== */

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.post(
  "/users",
  protect,
  authorizeRoles("admin"),
  createUserByAdmin
);

router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);


/* =====================================================
   DISCOUNT MANAGEMENT
===================================================== */

router.get(
  "/discounts",
  protect,
  authorizeRoles("admin"),
  getAllDiscounts
);

router.post(
  "/discounts",
  protect,
  authorizeRoles("admin"),
  createDiscount
);

router.patch(
  "/discounts/:id/toggle",
  protect,
  authorizeRoles("admin"),
  toggleDiscountStatus
);

router.delete(
  "/discounts/:id",
  protect,
  authorizeRoles("admin"),
  deleteDiscount
);


/* =====================================================
   AWARENESS HUB
===================================================== */

// Get all articles
router.get(
  "/awareness",
  protect,
  authorizeRoles("admin"),
  getAllArticles
);

// Get single article
router.get(
  "/awareness/:id",
  protect,
  authorizeRoles("admin"),
  getSingleArticle
);

// Create article
router.post(
  "/awareness",
  protect,
  authorizeRoles("admin"),
  createArticle
);

// Update article (for Edit button)
router.put(
  "/awareness/:id",
  protect,
  authorizeRoles("admin"),
  updateArticle
);

// Delete article
router.delete(
  "/awareness/:id",
  protect,
  authorizeRoles("admin"),
  deleteArticle
);


/* =====================================================
   ORDERS
===================================================== */

router.get(
  "/orders",
  protect,
  authorizeRoles("admin"),
  getAllOrdersAdmin
);

export default router;
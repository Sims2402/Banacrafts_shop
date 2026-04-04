import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import Artisan from "../models/Artisan.js"; // ← added

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

router.get(
  "/awareness",
  protect,
  authorizeRoles("admin"),
  getAllArticles
);

router.get(
  "/awareness/:id",
  protect,
  authorizeRoles("admin"),
  getSingleArticle
);

router.post(
  "/awareness",
  protect,
  authorizeRoles("admin"),
  createArticle
);

router.put(
  "/awareness/:id",
  protect,
  authorizeRoles("admin"),
  updateArticle
);

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

/* =====================================================
   ARTISAN MANAGEMENT  ← added
===================================================== */

router.get(
  "/artisans",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const artisans = await Artisan.find().sort({ createdAt: -1 });
      res.json({ success: true, data: artisans });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardData);
router.post(
  "/artisans",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const artisan = new Artisan(req.body);
      const saved = await artisan.save();
      res.status(201).json({ success: true, data: saved });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.put(
  "/artisans/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const updated = await Artisan.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.delete(
  "/artisans/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      await Artisan.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Artisan deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
import express from "express";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrderDetails,
  updateOrderStatus,
  confirmOrder,
  dispatchOrder,
  markOrderDelivered,
  requestCancelOrder,
  handleCancelAction,
  requestReturnOrExchange,
  handleReturnAction
} from "../controllers/order.controller.js";

import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

// ================= CREATE =================
router.post(
  "/",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  createOrder
);
router.get(
  "/seller/:sellerId",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerOrders  // controller must use req.params.sellerId
);

// ================= GET =================
router.get(
  "/my",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  getMyOrders
);

router.get(
  "/seller",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerOrders
);

router.get(
  "/:id",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  getOrderDetails
);

// ================= STATUS =================

// generic update
router.put(
  "/:id/status",
  protect,
  authorizeRoles("seller", "admin"),
  updateOrderStatus
);

// quick actions (from second code)
router.patch("/:id/confirm", protect, authorizeRoles("seller", "admin"), confirmOrder);
router.patch("/:id/dispatch", protect, authorizeRoles("seller", "admin"), dispatchOrder);
router.patch("/:id/deliver", protect, authorizeRoles("seller", "admin"), markOrderDelivered);

// ================= CANCEL =================
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  requestCancelOrder
);

router.put(
  "/:id/cancel/action",
  protect,
  authorizeRoles("seller", "admin"),
  handleCancelAction
);

// ================= RETURN / EXCHANGE =================
router.put(
  "/:id/return",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  requestReturnOrExchange
);

router.put(
  "/:id/return/action",
  protect,
  authorizeRoles("seller", "admin"),
  handleReturnAction
);

export default router;
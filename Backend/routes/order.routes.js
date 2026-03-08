import express from "express";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { requestCancelOrder } from "../controllers/order.controller.js";
import { handleCancelAction } from "../controllers/order.controller.js";
import { requestReturnOrExchange } from "../controllers/order.controller.js";
import { handleReturnAction } from "../controllers/order.controller.js";


const router = express.Router();

/* Seller/Admin - Update order status */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("seller", "admin"),
  updateOrderStatus
);

/* Customer - Request order cancellation */
router.put(
  "/:id/cancel",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  requestCancelOrder
);

/* Seller/Admin - Approve or reject cancellation */
router.put(
  "/:id/cancel/action",
  protect,
  authorizeRoles("seller", "admin"),
  handleCancelAction
);

/* Customer - Request return or exchange */
router.put(
  "/:id/return",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  requestReturnOrExchange
);

/* Seller/Admin - Approve or reject return/exchange */
router.put(
  "/:id/return/action",
  protect,
  authorizeRoles("seller", "admin"),
  handleReturnAction
);


/* Seller/Admin - Get orders for seller */
router.get(
  "/seller",
  protect,
  authorizeRoles("seller", "admin"),
  getSellerOrders
);

/* Get logged-in user's orders */
router.get(
  "/my",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  getMyOrders
);

/* Create Order (Customer) */
router.post(
  "/",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  createOrder
);

export default router;

import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/payment.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

/* Create Razorpay Order */
router.post(
  "/razorpay",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  createRazorpayOrder
);

/* Verify Razorpay Payment */
router.post(
  "/razorpay/verify",
  protect,
  authorizeRoles("customer", "seller", "admin"),
  verifyRazorpayPayment
);

export default router;

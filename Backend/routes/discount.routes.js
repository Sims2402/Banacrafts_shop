import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  getDiscounts,
  createDiscount,
  toggleDiscount,
  deleteDiscount,
} from "../controllers/discount.controller.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getDiscounts);
router.post("/", protect, authorizeRoles("admin"), createDiscount);
router.put("/:id/toggle", protect, authorizeRoles("admin"), toggleDiscount);
router.delete("/:id", protect, authorizeRoles("admin"), deleteDiscount);

export default router;
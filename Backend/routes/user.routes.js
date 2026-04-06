import express from "express";
import {
  updateUserProfile,
  changePassword,
  registerUser,
  loginUser,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
  uploadProfilePicture
} from "../controllers/User.controller.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.middleware.js"; // reuse same multer

const router = express.Router();

// ================= AUTH =================
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", sendPasswordResetOtp);
router.post("/verify-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPasswordWithToken);

// ================= PROFILE =================
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

// ================= PROFILE IMAGE =================
router.post(
  "/profile/upload",
  protect,
  upload.single("image"),
  uploadProfilePicture
);

export default router;
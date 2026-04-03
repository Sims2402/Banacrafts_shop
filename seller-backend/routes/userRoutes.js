const express = require("express");
const router = express.Router();

// 🔹 Controllers
const {
  updateProfile,
  changePassword,
  registerUser,
  loginUser,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
  uploadProfilePicture // ✅ ADD THIS
} = require("../controllers/userController");

// 🔹 Multer (profile upload)
const uploadProfile = require("../config/profileUpload"); // ✅ ADD THIS


// 🔹 Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth/forgot-password", sendPasswordResetOtp);
router.post("/auth/verify-otp", verifyPasswordResetOtp);
router.post("/auth/reset-password", resetPasswordWithToken);


// 🔹 Profile routes
router.put("/seller/profile/:userId", updateProfile);
router.patch("/seller/profile/password/:userId", changePassword);


//  NEW ROUTE (PROFILE IMAGE UPLOAD)
router.post(
  "/seller/profile/upload/:userId",
  uploadProfile.single("image"), // 👈 must match frontend
  uploadProfilePicture
);


module.exports = router;
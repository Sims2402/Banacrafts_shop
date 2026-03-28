import express from "express";
import { registerUser, loginUser,resetPassword,forgotPassword } from "../controllers/auth.controller.js";

const router = express.Router();

/* Auth Routes */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
export default router;

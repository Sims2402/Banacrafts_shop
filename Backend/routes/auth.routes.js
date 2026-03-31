import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* REGISTER */
router.post("/register", registerUser);

/* LOGIN */
router.post("/login", loginUser);

/* GET LOGGED IN USER */
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

export default router;

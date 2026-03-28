import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/* @desc   Register user
   @route  POST /api/auth/register
   @access Public
*/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    if (!/^(?=.*[A-Za-z])[A-Za-z0-9\s]+$/.test(name)) {
  return res.status(400).json({
    message: "Name must contain at least one letter",
  });
}
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Login user
   @route  POST /api/auth/login
   @access Public
*/
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const forgotPassword = async (req, res) => {
  try {
    console.log("🔥 API HIT");
    console.log("📩 Email:", req.body.email);

    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    console.log("👤 User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔑 Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log("🔑 Token saved");

    const resetUrl = `http://localhost:8080/reset-password/${resetToken}`;

    console.log("📧 Sending email...");

    await sendEmail(
      user.email,
      "Password Reset",
      `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes</p>
      `
    );

    console.log("✅ Email sent");

    res.json({ message: "Reset email sent" });

  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
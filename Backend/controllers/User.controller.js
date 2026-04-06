import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { buildMailer } from "../utils/mailer.js"; 
// ================= HELPER =================
function toPublicUser(userDoc) {
  if (!userDoc) return null;

  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete u.password;

  const pic =
    u.profilePicture ??
    u.profileImage ??
    u.avatar ??
    u.image ??
    u.photo;

  u.profilePicture = pic || "";
  if (u._id && !u.id) u.id = String(u._id);

  return u;
}

// ================= UPDATE PROFILE =================
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { name, phone, address, avatar } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    const updateFields = {
      name: name.trim(),
      phone: phone || "",
      address: address || ""
    };

    if (avatar?.startsWith("data:image")) {
      updateFields.avatar = avatar;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    res.json(toPublicUser(updated));

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const resetPasswordWithToken = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const emailStr = String(email).trim().toLowerCase();

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ email: emailStr });

    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check token
    if (
      !user.passwordResetTokenHash ||
      user.passwordResetTokenHash !== resetToken
    ) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.password = String(newPassword).trim();

    // Clear reset fields
    user.passwordResetTokenHash = "";
    user.passwordResetTokenExpiresAt = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Fill both fields." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Min 6 characters." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ message: "Password changed." });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const emailStr = String(email).trim().toLowerCase();

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name required" });
    }

    if (!emailStr) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password min 6 chars" });
    }

    const existing = await User.findOne({ email: emailStr });
    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: emailStr,
      password: hashed,
      role
    });

    res.status(201).json({
      message: "User registered",
      user: toPublicUser(user)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: toPublicUser(user)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPLOAD PROFILE PIC =================
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    res.status(200).json(toPublicUser(user));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= OTP HELPERS =================
function otpSecret() {
  return process.env.OTP_SECRET || process.env.JWT_SECRET || "dev-secret";
}

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function makeOtpCode() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}
// SEND OTP
export const sendPasswordResetOtp = async (req, res) => {
  try {
    const email = String(req.body.email).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If exists, OTP sent" });
    }

    const code = makeOtpCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const { transporter, from } = buildMailer();

    await transporter.sendMail({
      from,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${code}`
    });

    user.passwordResetOtpHash = sha256(`${code}:${otpSecret()}`);
    user.passwordResetOtpExpiresAt = expires;

    await user.save();

    res.json({ message: "OTP sent" });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// VERIFY OTP
export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const emailStr = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: emailStr });

    if (!user) return res.status(400).json({ message: "Invalid OTP" });

    const valid =
      user.passwordResetOtpHash === sha256(`${otp}:${otpSecret()}`);

    if (!valid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    user.passwordResetTokenHash = resetToken;
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.json({ message: "OTP verified", resetToken });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
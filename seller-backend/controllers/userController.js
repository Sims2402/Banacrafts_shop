const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { buildMailer } = require("../utils/mailer");

/** Safe JSON for API: never expose password; always include profilePicture from DB */
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
  const profilePicture =
    pic != null && String(pic).trim() !== "" ? String(pic).trim() : "";
  u.profilePicture = profilePicture;
  if (u._id != null && (u.id == null || u.id === "")) {
    u.id = String(u._id);
  }
  return u;
}

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, phone } = req.body;

    // phone validation
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone must be exactly 10 digits"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(toPublicUser(user));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ compare plain input with hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    // ✅ hash new password directly (clean way)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }
    const emailStr = String(email || "").trim().toLowerCase();
    if (!emailStr) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!password || String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const roleStr = String(role || "").toLowerCase();
    if (!["customer", "seller", "admin"].includes(roleStr)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name: String(name).trim(),
      email: emailStr,
      password: hashedPassword,
      role: roleStr // 👈 important (seller/customer)
    });

    res.status(201).json({
      message: "User registered successfully",
      user: toPublicUser(user)
    });

  } catch (error) {
    console.error("registerUser error", {
      message: error?.message,
      stack: error?.stack,
      body: req?.body,
    });
    res.status(500).json({
      message: "Registration failed",
      error: error?.message,
    });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: toPublicUser(user)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ================= UPLOAD PROFILE PICTURE =================
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ❌ no file
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // ✅ multer-storage-cloudinary gives URL here
    const imageUrl = req.file.path;

    // update user
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(toPublicUser(user));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function otpSecret() {
  return (
    process.env.OTP_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SECRET ||
    "dev-otp-secret"
  );
}

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function makeOtpCode() {
  // 6-digit numeric, leading zeros allowed
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

// ================= FORGOT PASSWORD (OTP) =================
// POST /auth/forgot-password { email }
exports.sendPasswordResetOtp = async (req, res) => {
  try {
    const emailStr = String(req.body?.email || "").trim().toLowerCase();
    if (!emailStr) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email: emailStr });
    // Do not reveal whether user exists
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, an OTP has been sent.",
      });
    }

    const code = makeOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const { transporter, from } = buildMailer();
    const appName = process.env.APP_NAME || "BanaCrafts";

    try {
      // validate transporter config early for clearer errors
      await transporter.verify();
      await transporter.sendMail({
        from,
        to: emailStr,
        subject: `${appName} password reset code`,
        text: `Your ${appName} password reset code is ${code}. It expires in 10 minutes.`,
      });
    } catch (mailError) {
      console.error("sendPasswordResetOtp mail error", {
        message: mailError?.message,
        code: mailError?.code,
        response: mailError?.response,
        responseCode: mailError?.responseCode,
        command: mailError?.command,
      });
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    // Only persist OTP if email actually sent
    user.passwordResetOtpHash = sha256(`${code}:${otpSecret()}`);
    user.passwordResetOtpExpiresAt = expiresAt;
    user.passwordResetTokenHash = "";
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: "If the email exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("sendPasswordResetOtp error", {
      message: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({
      message: "Failed to send OTP email. Check EMAIL_USER/EMAIL_PASS.",
      error: error?.message,
    });
  }
};

// POST /auth/verify-otp { email, otp }
// Returns resetToken used for reset-password
exports.verifyPasswordResetOtp = async (req, res) => {
  try {
    const emailStr = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();
    if (!emailStr || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    const user = await User.findOne({ email: emailStr });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (
      !user.passwordResetOtpHash ||
      !user.passwordResetOtpExpiresAt ||
      user.passwordResetOtpExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    const expected = user.passwordResetOtpHash;
    const actual = sha256(`${otp}:${otpSecret()}`);
    if (expected !== actual) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetTokenHash = sha256(`${rawToken}:${otpSecret()}`);
    user.passwordResetTokenExpiresAt = tokenExpiresAt;
    // burn OTP after verification
    user.passwordResetOtpHash = "";
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: "OTP verified",
      resetToken: rawToken,
      expiresAt: tokenExpiresAt.toISOString(),
    });
  } catch (error) {
    console.error("verifyPasswordResetOtp error", {
      message: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// POST /auth/reset-password { email, resetToken, newPassword }
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const emailStr = String(req.body?.email || "").trim().toLowerCase();
    const resetToken = String(req.body?.resetToken || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!emailStr || !resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, resetToken, and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email: emailStr });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }
    if (
      !user.passwordResetTokenHash ||
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Reset token expired. Please retry." });
    }

    const expected = user.passwordResetTokenHash;
    const actual = sha256(`${resetToken}:${otpSecret()}`);
    if (expected !== actual) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetTokenHash = "";
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("resetPasswordWithToken error", {
      message: error?.message,
      stack: error?.stack,
    });
    return res.status(500).json({ message: "Failed to reset password" });
  }
};
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: String,
  email: String,
  password: String,

  phone: {
    type: String,
    default: ""
  },

  profilePicture: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["admin", "seller", "customer"],
    default: "customer"
  },

  // Password reset via OTP email verification
  passwordResetOtpHash: { type: String, default: "" },
  passwordResetOtpExpiresAt: { type: Date, default: null },
  passwordResetTokenHash: { type: String, default: "" },
  passwordResetTokenExpiresAt: { type: Date, default: null },

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
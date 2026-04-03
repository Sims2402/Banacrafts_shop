import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar:  { type: String, default: null },
    phone:   { type: String, default: "" },
    address: { type: String, default: "" },

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer"
    },

    phone: String,
    address: String
  },
  {
    timestamps: true,
    collection: "users"
  }
);

/* 🔐 HASH PASSWORD (Mongoose 7 correct way) */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔐 COMPARE PASSWORD */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

/* ================= REGISTER USER ================= */
export const registerUser = async (req, res) => {
  try {
    let { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    email = email.trim().toLowerCase();

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
      address,
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


/* ================= LOGIN USER ================= */
export const loginUser = async (req, res) => {
  try {
    // ✅ STEP 1: also extract `role` from the request body
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const emailStr = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: emailStr });

    if (!user) {
      console.log("❌ User not found for:", emailStr);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password || typeof user.password !== "string") {
      console.error("Login failed: user has invalid password hash", {
        userId: String(user._id),
        email: emailStr,
        passwordType: typeof user.password,
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const cleanInput = String(password).trim();
    const isMatch = await bcrypt.compare(cleanInput, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ STEP 2: if a role was sent, verify it matches the user's actual role in DB
    if (role && user.role !== role) {
      console.log(`❌ Role mismatch: selected "${role}" but account is "${user.role}"`);
      return res.status(403).json({ message: "Incorrect role selected for this account." });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", {
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ message: error.message });
  }
};
import User from "../models/User.js";
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
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    let { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    email = email.trim().toLowerCase();

    console.log("📩 Email received:", email);
    console.log("🔐 Password received:", password);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("✅ User found");
    console.log("Stored hash:", user.password);

    const isMatch = await user.matchPassword(password);

    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ STEP 2: if a role was sent, verify it matches the user's actual role in DB
    if (role && user.role !== role) {
      console.log(`❌ Role mismatch: selected "${role}" but account is "${user.role}"`);
      return res.status(403).json({ message: "Incorrect role selected for this account." });
    }

    console.log("🎉 LOGIN SUCCESS");

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
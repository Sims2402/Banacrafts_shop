import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import artisanRoutes from "./routes/artisan.routes.js";
import awarenessRoutes from "./routes/awareness.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import discountRoutes from "./routes/discountRoutes.js"; // ✅ ADD THIS

dotenv.config();

/* CONNECT DATABASE */
connectDB();

/* CREATE APP */
const app = express();

/* MIDDLEWARE */
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/awareness", awarenessRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/admin/artisans", artisanRoutes);

// ✅ THIS WAS MISSING
app.use("/api/discounts", discountRoutes);

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.json({ success: true, message: "BanaCrafts Backend is running 🚀" });
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server Error" });
});

/* SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
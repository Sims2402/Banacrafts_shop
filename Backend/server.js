import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";

// ROUTES
import artisanRoutes from "./routes/artisan.routes.js";
import awarenessRoutes from "./routes/awareness.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// CONFIG
dotenv.config({
  path: path.resolve("./.env")
});

const app = express();

// DB
connectDB();

// MIDDLEWARE
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/artisans", artisanRoutes);
app.use("/api/awareness", awarenessRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// HEALTH
app.get("/", (req, res) => {
  res.json({ message: "Server running 🚀" });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
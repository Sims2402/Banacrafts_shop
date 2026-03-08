import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";


dotenv.config();
connectDB();
const app = express();

/* Middleware */
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/uploads", express.static("uploads"));

/* Health check route */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BanaCrafts Backend is running 🚀"
  });
});

/* Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

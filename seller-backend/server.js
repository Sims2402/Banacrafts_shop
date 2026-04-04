const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// So browsers (and DevTools) always show a fresh JSON body for APIs — avoids empty 304 bodies.
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// connect database
connectDB();

// import routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const discountRoutes = require("./routes/discountRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const artisanRoutes = require("./routes/artisanRoutes");
const awarenessRoutes = require("./routes/awarenessPublicRoutes");
// use routes
app.use(userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/awareness", awarenessRoutes);
app.use("/seller/discounts", discountRoutes);
app.use(reviewRoutes);
app.use(dashboardRoutes);
// test route
app.get("/", (req, res) => {
  res.send("Seller backend running");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
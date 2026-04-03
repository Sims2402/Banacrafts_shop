const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Product = require("../models/Product"); 

const {
  addProduct,
  getSellerProducts,
  deleteProduct,
  updateProduct,
  getProductById,
  submitProductRating,
} = require("../controllers/productController");

router.post("/seller/products", upload.single("image"), addProduct);

router.get("/seller/products/:sellerId", getSellerProducts);

router.delete("/seller/products/:id", deleteProduct);

router.put("/seller/products/:id", updateProduct);

router.post("/:id/rate", submitProductRating);

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", getProductById);

module.exports = router;
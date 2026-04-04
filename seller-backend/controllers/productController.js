const mongoose = require("mongoose");
const Product = require("../models/Product");
const { enrichProductObject, enrichProductsWithPricing } = require("../utils/priceCalculator");

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    const productDoc = await Product.findById(id).populate(
      "seller",
      "name profilePicture role"
    );

    if (!productDoc) {
      return res.status(404).json({ error: "Not found" });
    }

    const payload = await enrichProductObject(productDoc);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    // ✅ FIX TAGS HERE
    let parsedTags = [];

    if (req.body.tags) {
      try {
        parsedTags = JSON.parse(req.body.tags);
      } catch {
        parsedTags = [];
      }
    }

    const { ratings: _r, rating: _avg, numRatings: _n, ...safeBody } = req.body;

    const product = new Product({
      ...safeBody,
      seller: req.body.seller,
      tags: parsedTags, // ✅ THIS IS WHERE product.tags IS SET
      ratings: [],
      numRatings: 0,
      rating: 0,

      images: req.file
        ? [
            {
              url: req.file.path,
              public_id: req.file.filename,
            },
          ]
        : [],
    });

    await product.save();

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    console.log("HIT SELLER PRODUCTS API");
    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });
    const updatedProducts = await enrichProductsWithPricing(products);

    res.status(200).json(updatedProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {

  try {

    const productId = req.params.id;

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updateProduct = async (req, res) => {

  try {

    const productId = req.params.id;

    const { ratings: _r, rating: _avg, numRatings: _n, ...safeBody } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      safeBody,
      { new: true }
    );

    res.status(200).json(updatedProduct);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

/** POST /api/products/:id/rate — body: { userId, value } value 1–5; one rating per user (updates if exists) */
exports.submitProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, value } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const v = Number(value);
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (String(product.seller) === String(userId)) {
      return res.status(403).json({ error: "You cannot rate your own product" });
    }

    const ratings = Array.isArray(product.ratings) ? [...product.ratings] : [];
    const idx = ratings.findIndex((r) => String(r.user) === String(userId));
    const entry = { user: userId, value: Math.round(v) };
    if (idx >= 0) {
      ratings[idx] = entry;
    } else {
      ratings.push(entry);
    }

    const numRatings = ratings.length;
    const sum = ratings.reduce((s, r) => s + (Number(r.value) || 0), 0);
    const avg = numRatings ? Math.round((sum / numRatings) * 10) / 10 : 0;

    product.ratings = ratings;
    product.numRatings = numRatings;
    product.rating = avg;
    await product.save();

    const productDoc = await Product.findById(product._id).populate(
      "seller",
      "name profilePicture role"
    );
    const payload = await enrichProductObject(productDoc);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
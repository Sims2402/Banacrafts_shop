import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// ================= GET SELLER REVIEWS =================
export const getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({
      product: { $in: productIds }
    })
      .populate("user", "name")
      .populate("product", "name");

    res.status(200).json(reviews);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= CREATE REVIEW =================
export const createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= REPLY =================
export const replyToReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { reply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { reply },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= STATS =================
export const getReviewStats = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({
      product: { $in: productIds }
    });

    const totalReviews = reviews.length;
    const replied = reviews.filter(r => r.reply !== null).length;

    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      (reviews.length || 1);

    res.json({
      averageRating: avg.toFixed(1),
      totalReviews,
      replied
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
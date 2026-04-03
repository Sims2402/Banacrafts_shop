const Review = require("../models/Review");
const Product = require("../models/Product");


// Get all reviews for seller products
exports.getSellerReviews = async (req, res) => {

  try {

    const sellerId = req.params.sellerId;

    // find seller products
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


// Seller reply to review
const mongoose = require("mongoose");

exports.replyToReview = async (req, res) => {
  try {

    const reviewId = req.params.reviewId;
    const { reply } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $set: { reply: reply } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seller review stats
exports.getReviewStats = async (req, res) => {

  try {

    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });

    const productIds = products.map(p => p._id);

    const reviews = await Review.find({
      product: { $in: productIds }
    });

    const totalReviews = reviews.length;

    const replied = reviews.filter(r => r.reply !== null).length;

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      (reviews.length || 1);

    res.status(200).json({
      averageRating: averageRating.toFixed(1),
      totalReviews,
      replied
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.createReview = async (req, res) => {

  try {

    const Review = require("../models/Review");

    const review = new Review(req.body);

    await review.save();

    res.status(201).json(review);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
const express = require("express");
const router = express.Router();

const {
  createReview,
  getSellerReviews,
  replyToReview,
  getReviewStats
} = require("../controllers/reviewController");

// create review
router.post("/seller/reviews", createReview);

// review stats
router.get("/seller/reviews/stats/:sellerId", getReviewStats);

// reply to review
router.patch("/seller/review-reply/:reviewId", replyToReview);

// get reviews for seller
router.get("/seller/reviews/:sellerId", getSellerReviews);

module.exports = router;
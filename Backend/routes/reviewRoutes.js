import express from "express";

import {
  createReview,
  getSellerReviews,
  replyToReview,
  getReviewStats
} from "../controllers/reviewController.js";

const router = express.Router();

// ================= CREATE =================
router.post(
  "/",
  createReview
);

// ================= SELLER =================

// stats
router.get(
  "/seller/stats/:sellerId",
  getReviewStats
);

// reply
router.patch(
  "/:reviewId/reply",
  replyToReview
);

// get seller reviews
router.get(
  "/seller/:sellerId",
  getSellerReviews
);

export default router;
const express = require("express");
const router = express.Router();

const {
  createDiscount,
  getSellerDiscounts,
  deleteDiscount,
  updateDiscount,
  toggleDiscountStatus
} = require("../controllers/discountController");


// create discount
router.post("/", createDiscount);

// get seller discounts
router.get("/:sellerId", getSellerDiscounts);

// update discount
router.put("/:id", updateDiscount);

// delete discount
router.delete("/:id", deleteDiscount);

// toggle active / inactive
router.patch("/:id/toggle", toggleDiscountStatus);


module.exports = router;
const Discount = require("../models/Discount");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Create Discount
exports.createDiscount = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const { type, value, product } = req.body; // ✅ include product

    // ✅ VALIDATION
    if (type === "percentage" && value > 100) {
      return res.status(400).json({
        error: "Percentage cannot exceed 100"
      });
    }

    if (value < 0) {
      return res.status(400).json({
        error: "Discount cannot be negative"
      });
    }

    const discount = new Discount({
      ...req.body,
      product: product,
      seller: req.body.seller //  THIS IS THE KEY FIX
    });

    await discount.save();

    res.status(201).json(discount);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get Seller Discounts
exports.getSellerDiscounts = async (req, res) => {

  try {

    const discounts = await Discount.find({
      seller: req.params.sellerId
    }).populate("product");

    res.status(200).json(discounts);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// Delete Discount
exports.deleteDiscount = async (req, res) => {

  try {

    const discountId = req.params.id;

    await Discount.findByIdAndDelete(discountId);

    res.status(200).json({ message: "Discount deleted successfully" });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// Update Discount
exports.updateDiscount = async (req, res) => {

  try {

    const discountId = req.params.id;

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      req.body,
      { new: true }
    );

    res.status(200).json(discount);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// Toggle Active / Inactive
exports.toggleDiscountStatus = async (req, res) => {

  try {

    const discountId = req.params.id;

    const discount = await Discount.findById(discountId);
    
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    
    discount.active = !discount.active;

    await discount.save();

    res.status(200).json(discount);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
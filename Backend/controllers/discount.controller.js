import Discount from "../models/Discount.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// ================= GET ALL (admin) =================
export const getDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate("product")
      .sort({ createdAt: -1 });
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET SELLER DISCOUNTS =================
// ✅ uses req.user._id from token — no sellerId param needed
export const getSellerDiscounts = async (req, res) => {
  try {
    const sellerId = req.user._id;  // ✅ from protect middleware

    const discounts = await Discount.find({ seller: sellerId })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= CREATE =================
export const createDiscount = async (req, res) => {
  try {
    const { type, value, product } = req.body;

    if (type === "percentage" && value > 100) {
      return res.status(400).json({ error: "Percentage cannot exceed 100" });
    }
    if (value < 0) {
      return res.status(400).json({ error: "Discount cannot be negative" });
    }

    const discount = new Discount({
      ...req.body,
      product,
      // ✅ always use the authenticated user as seller — ignore req.body.seller
      // so a seller can't create discounts on behalf of another seller
      seller: req.user._id,
    });

    await discount.save();
    await discount.populate("product");

    res.status(201).json(discount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
export const updateDiscount = async (req, res) => {
  try {
    // ✅ ensure seller can only update their own discount
    const discount = await Discount.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!discount) {
      return res.status(404).json({ message: "Discount not found or not yours" });
    }

    Object.assign(discount, req.body);
    await discount.save();
    await discount.populate("product");

    res.status(200).json(discount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= TOGGLE =================
export const toggleDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!discount) {
      return res.status(404).json({ message: "Discount not found or not yours" });
    }

    // ✅ handle both field names
    if (typeof discount.isActive !== "undefined") discount.isActive = !discount.isActive;
    if (typeof discount.active  !== "undefined") discount.active   = !discount.active;

    await discount.save();
    res.status(200).json(discount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
export const deleteDiscount = async (req, res) => {
  try {
    // ✅ ensure seller can only delete their own discount
    const discount = await Discount.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!discount) {
      return res.status(404).json({ message: "Discount not found or not yours" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
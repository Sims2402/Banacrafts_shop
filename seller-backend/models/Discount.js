const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },

  value: {
    type: Number,
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  validFrom: Date,

  validUntil: Date,

  usageCount: {
    type: Number,
    default: 0
  },

  active: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Discount", discountSchema);
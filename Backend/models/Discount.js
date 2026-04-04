import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },

    // from first schema
    label: { type: String, default: "" },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: { type: Number, required: true },

    // from first schema
    scope: {
      type: String,
      enum: ["site", "category", "product"],
      default: "site",
    },

    // from second schema (IMPORTANT for your controllers)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // MERGED DATE FIELDS
    validFrom: { type: Date },
    validTill: { type: Date },     // used in first
    validUntil: { type: Date },    // used in second

    // MERGED USAGE FIELDS
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },

    // MERGED ACTIVE FLAGS
    isActive: { type: Boolean, default: true },
    active: { type: Boolean },

    createdBy: {
      type: String,
      enum: ["admin", "seller"],
      default: "admin",
    },
  },
  {
    timestamps: true,
    strict: false // prevents crashes during merge phase
  }
);

export default mongoose.model("Discount", discountSchema);
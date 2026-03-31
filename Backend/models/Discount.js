import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    label: { type: String, required: true },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: { type: Number, required: true },

    scope: {
      type: String,
      enum: ["site", "category", "product"],
      default: "site",
    },

    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },

    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },

    isActive: { type: Boolean, default: true },

    createdBy: {
      type: String,
      enum: ["admin", "seller"],
      default: "admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
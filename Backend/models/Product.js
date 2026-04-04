import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    // from second schema (useful for discounts)
    originalPrice: {
      type: Number
    },

    images: [
      {
        public_id: String,
        url: String
      }
    ],

    material: { type: String },

    category: {
      type: String,
      required: true
    },

    tags: [{ type: String }],

    returnable: {
      type: Boolean,
      default: true
    },

    // availability fields (merged)
    available: {
      type: Boolean,
      default: true
    },

    inStock: {
      type: Boolean,
      default: true
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    discountPercentage: {
      type: Number,
      default: 0
    },

    // ================= RATINGS SYSTEM =================
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        value: {
          type: Number,
          min: 1,
          max: 5
        }
      }
    ],

    numRatings: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    strict: false // safe during merge phase
  }
);

export default mongoose.model("Product", productSchema);
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

    /** Stock count; inStock / available are derived virtuals (quantity > 0). */
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
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
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual("inStock").get(function () {
  return (this.quantity ?? 0) > 0;
});

productSchema.virtual("available").get(function () {
  return (this.quantity ?? 0) > 0;
});

export default mongoose.model("Product", productSchema);

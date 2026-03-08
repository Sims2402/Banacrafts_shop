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
    images: [
      {
        public_id: String,
        url: String
      }
    ],
    material: {
      type: String
    },
    category: {
      type: String,
      required: true
    },
    tags: [
      {
        type: String
      }
    ],
    returnable: {
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
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

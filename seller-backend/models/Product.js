const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  name: String,
  description: String,

  price: Number,
  originalPrice: Number, 

  images: [
    {
    url: String,
    public_id: String
    }
  ],

  material: String,
  category: String,

  tags: [String],

  returnable: Boolean,

    available: {       
    type: Boolean,
    default: true
  }, 

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  discountPercentage: {
    type: Number,
    default: 0
  },

  inStock: {
  type: Boolean,
  default: true,
},

  /** One rating per user; value is 1–5 */
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      value: { type: Number, min: 1, max: 5 },
    },
  ],

  numRatings: {
    type: Number,
    default: 0,
  },

  /** Average of all rating values (updated when ratings change) */
  rating: {
    type: Number,
    default: 0,
  },

},
{ timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],

  deliveryMethod: String,
  deliveryAddress: String,
  phone: String,

  paymentMethod: String,
  paymentStatus: String,

  orderStatus: String,

  totalPrice: Number,

  cancelRequested: Boolean,
  cancelStatus: String,

  returnRequested: Boolean,
  returnStatus: String,
  returnType: String

},
{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
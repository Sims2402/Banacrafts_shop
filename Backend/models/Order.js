import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orderItems: [orderItemSchema],

    deliveryMethod: {
      type: String,
      enum: ["self_pickup", "seller_delivery"],
      required: true
    },

    deliveryAddress: {
      type: String
    },

    phone: {
      type: String
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Dispatched", "Delivered", "Cancelled"],
      default: "Pending"
    },

    totalPrice: {
      type: Number,
      required: true
    },

    cancelRequested: {
      type: Boolean,
      default: false
    },

    cancelStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None"
    },
    returnRequested: {
      type: Boolean,
      default: false
    },
    returnType: {
      type: String,
      enum: ["Return", "Exchange", null],
    default: null
    },
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None"
    }


  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;


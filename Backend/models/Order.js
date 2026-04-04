import mongoose from "mongoose";

// ================= ORDER ITEM =================
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String },
    price: { type: Number },

    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// ================= ORDER =================
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [orderItemSchema],

    deliveryMethod: {
      type: String,
      enum: ["self_pickup", "seller_delivery"],
      required: true,
    },

    deliveryAddress: { type: String },
    phone: { type: String },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash"],
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled"],
      default: "Pending",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // ================= CANCEL =================
    cancelRequested: {
      type: Boolean,
      default: false,
    },

    cancelStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None",
    },

    // ================= RETURN / EXCHANGE =================
    returnRequested: {
      type: Boolean,
      default: false,
    },

    returnType: {
      type: String,
      enum: ["Return", "Exchange", null],
      default: null,
    },

    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// ✅ THIS IS IMPORTANT (clean export)
const Order = mongoose.model("Order", orderSchema);
export default Order;
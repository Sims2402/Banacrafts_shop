import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      deliveryMethod,
      deliveryAddress,
      phone,
      paymentMethod
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (deliveryMethod === "seller_delivery" && (!deliveryAddress || !phone)) {
      return res.status(400).json({
        message: "Delivery address and phone are required"
      });
    }

    let totalPrice = 0;
    const items = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      totalPrice += product.price * item.quantity;

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      user: req.user?._id || req.body.user, // supports BOTH systems
      orderItems: items,
      deliveryMethod,
      deliveryAddress,
      phone,
      paymentMethod,
      totalPrice,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Paid"
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SELLER ORDERS (MERGED BOTH LOGICS) =================
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.params.sellerId || req.user?._id;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price seller")
      .sort({ createdAt: -1 });

    const filteredOrders = orders
      .map(order => {
        const sellerItems = order.orderItems.filter(item =>
          item.product &&
          item.product.seller &&
          item.product.seller.toString() === sellerId.toString()
        );

        if (sellerItems.length === 0) return null;

        return {
          ...order._doc,
          orderItems: sellerItems
        };
      })
      .filter(order => order !== null);

    res.status(200).json(filteredOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ORDER DETAILS =================
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId || req.params.id)
      .populate("user", "-password")
      .populate("orderItems.product");

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE STATUS (GENERIC) =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ message: "Order status updated", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= QUICK ACTIONS =================
export const confirmOrder = async (req, res) => {
  return updateOrderStatus({ ...req, body: { status: "Confirmed" } }, res);
};

export const dispatchOrder = async (req, res) => {
  return updateOrderStatus({ ...req, body: { status: "Dispatched" } }, res);
};

export const markOrderDelivered = async (req, res) => {
  return updateOrderStatus({ ...req, body: { status: "Delivered" } }, res);
};

// ================= CANCEL REQUEST =================
export const requestCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.cancelRequested = true;
    order.cancelStatus = "Requested";

    await order.save();

    res.json({ message: "Cancellation requested", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= HANDLE CANCEL =================
export const handleCancelAction = async (req, res) => {
  try {
    const { action } = req.body;

    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (action === "approve") {
      order.cancelStatus = "Approved";
      order.orderStatus = "Cancelled";
    } else {
      order.cancelStatus = "Rejected";
    }

    order.cancelRequested = false;

    await order.save();

    res.json({ message: `Cancellation ${action}d`, order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RETURN / EXCHANGE =================
export const requestReturnOrExchange = async (req, res) => {
  try {
    const { type } = req.body;

    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.returnRequested = true;
    order.returnType = type;
    order.returnStatus = "Requested";

    await order.save();

    res.json({ message: `${type} requested`, order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleReturnAction = async (req, res) => {
  try {
    const { action } = req.body;

    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.returnStatus = action === "approve" ? "Approved" : "Rejected";
    order.returnRequested = false;

    await order.save();

    res.json({ message: `Return ${action}d`, order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
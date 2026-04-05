import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/** Positive integer line qty; always >= 1 (legacy / invalid payloads). */
function resolveLineQuantity(item) {
  const raw = item?.quantity;
  const q = Number(raw);
  if (!Number.isFinite(q)) return 1;
  const n = Math.floor(q);
  return n >= 1 ? n : 1;
}

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  const decremented = [];

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

    // ----- Stock validation only (no order creation, no quantity changes) -----
    for (const item of orderItems) {
      const pid = item.product;
      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ message: "Invalid product id" });
      }

      const requestedQty = resolveLineQuantity(item);

      const product = await Product.findById(pid);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const stock = product.quantity;
      if (stock === undefined || stock === null) {
        return res.status(409).json({ message: "Product is out of stock" });
      }

      const available = Number(stock);
      if (!Number.isFinite(available) || available < requestedQty) {
        return res.status(409).json({ message: "Product is out of stock" });
      }
    }

    let totalPrice = 0;
    const items = [];

    for (const item of orderItems) {
      const pid = item.product;
      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        await rollbackStock(decremented);
        return res.status(400).json({ message: "Invalid product id" });
      }

      const qty = resolveLineQuantity(item);

      const product = await Product.findById(pid);

      if (!product) {
        await rollbackStock(decremented);
        return res.status(404).json({ message: "Product not found" });
      }

      const updated = await Product.findOneAndUpdate(
        { _id: pid, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );

      if (!updated) {
        await rollbackStock(decremented);
        const fresh = await Product.findById(pid).select("name quantity");
        const available = Number.isFinite(fresh?.quantity)
          ? fresh.quantity
          : Number(product.quantity) || 0;
        return res.status(409).json({
          message: "Insufficient stock for one or more items",
          productId: String(pid),
          productName: fresh?.name ?? product.name,
          requested: qty,
          available
        });
      }

      decremented.push({ id: pid, qty });

      totalPrice += product.price * qty;

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    const order = await Order.create({
      user: req.user?._id || req.body.user,
      orderItems: items,
      deliveryMethod,
      deliveryAddress,
      phone,
      paymentMethod,
      totalPrice,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Paid",
      inventoryCommitted: true
    });

    res.status(201).json(order);
  } catch (error) {
    await rollbackStock(decremented);
    res.status(500).json({ message: error.message });
  }
};

async function rollbackStock(decremented) {
  for (const { id, qty } of [...decremented].reverse()) {
    await Product.findByIdAndUpdate(id, { $inc: { quantity: qty } });
  }
}

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
      .populate("orderItems.product", "name images price seller")
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

/**
 * Patch order status without document.save() — full saves re-validate nested
 * orderItems and can 500 on legacy DB rows (same issue confirmOrder avoided).
 */
async function patchOrderStatus(orderId, status) {
  return Order.findByIdAndUpdate(
    orderId,
    { $set: { orderStatus: status } },
    { new: true, runValidators: false }
  );
}

// ================= UPDATE STATUS (GENERIC) =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const updatedOrder = await patchOrderStatus(orderId, status);

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    res.status(500).json({
      message: error?.message || "Failed to update order status"
    });
  }
};

// ================= QUICK ACTIONS =================
/** Seller confirm: order status only — inventory is managed by the customer order system. */
export const confirmOrder = async (req, res) => {
  try {
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "Confirmed") {
      return res.status(200).json({
        message: "Order already confirmed",
        order
      });
    }

    const items = order.orderItems || [];
    if (items.length === 0) {
      return res.status(400).json({ message: "Order has no line items" });
    }

    const updatedOrder = await patchOrderStatus(orderId, "Confirmed");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order confirmed", order: updatedOrder });
  } catch (error) {
    console.error("[confirmOrder]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { cancelRequested: true, cancelStatus: "Requested" } },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Cancellation requested", order: updatedOrder });
  } catch (error) {
    console.error("[requestCancelOrder]", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= HANDLE CANCEL =================
export const handleCancelAction = async (req, res) => {
  try {
    const { action } = req.body;
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const setFields =
      action === "approve"
        ? {
            cancelStatus: "Approved",
            orderStatus: "Cancelled",
            cancelRequested: false
          }
        : { cancelStatus: "Rejected", cancelRequested: false };

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: setFields },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: `Cancellation ${action}d`, order: updatedOrder });
  } catch (error) {
    console.error("[handleCancelAction]", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= RETURN / EXCHANGE =================
export const requestReturnOrExchange = async (req, res) => {
  try {
    const { type } = req.body;
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          returnRequested: true,
          returnType: type,
          returnStatus: "Requested"
        }
      },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: `${type} requested`, order: updatedOrder });
  } catch (error) {
    console.error("[requestReturnOrExchange]", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleReturnAction = async (req, res) => {
  try {
    const { action } = req.body;
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          returnStatus: action === "approve" ? "Approved" : "Rejected",
          returnRequested: false
        }
      },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: `Return ${action}d`, order: updatedOrder });
  } catch (error) {
    console.error("[handleReturnAction]", error);
    res.status(500).json({ message: error.message });
  }
};
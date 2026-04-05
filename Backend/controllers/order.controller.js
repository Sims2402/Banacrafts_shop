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

/**
 * Order line product ref: populated document has ._id; otherwise ObjectId or string.
 */
function lineProductId(item) {
  const p = item?.product;
  if (p === undefined || p === null || p === "") {
    return undefined;
  }
  if (typeof p === "object") {
    if (p._id != null) {
      return p._id;
    }
    return p;
  }
  return p;
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

/** Legacy orders may omit item.quantity; coerce to a valid positive int before save/stock logic. */
function normalizeLegacyOrderItemQuantities(order) {
  if (!order?.orderItems?.length) return;
  for (const item of order.orderItems) {
    const q = Number(item.quantity);
    if (!Number.isInteger(q) || q < 1) {
      item.quantity = 1;
    }
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
    res.status(500).json({
      message: error?.message || "Failed to update order status"
    });
  }
};

const CONFIRM_OUT_OF_STOCK_MSG =
  "Cannot confirm order: Product is out of stock";

// ================= QUICK ACTIONS =================
export const confirmOrder = async (req, res) => {
  const decremented = [];

  try {
    const orderId = req.params.id || req.params.orderId;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    normalizeLegacyOrderItemQuantities(order);

    if (order.orderStatus === "Confirmed") {
      return res.status(200).json({
        message: "Order already confirmed",
        order
      });
    }

    const alreadyCommitted = order.inventoryCommitted === true;

    if (!alreadyCommitted) {
      const items = order.orderItems || [];

      if (items.length === 0) {
        return res.status(400).json({ message: "Order has no line items" });
      }

      for (const item of items) {
        const productId = lineProductId(item);

        if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
          await rollbackStock(decremented);
          return res.status(400).json({ message: "Invalid product reference" });
        }

        const requiredQty = resolveLineQuantity(item);

        const product = await Product.findById(productId);

        if (!product) {
          await rollbackStock(decremented);
          return res.status(404).json({ message: "Product not found" });
        }

        const availableQty = Number(product.quantity) || 0;

        if (availableQty < requiredQty) {
          await rollbackStock(decremented);
          return res.status(409).json({ message: CONFIRM_OUT_OF_STOCK_MSG });
        }

        const updated = await Product.findOneAndUpdate(
          { _id: productId, quantity: { $gte: requiredQty } },
          { $inc: { quantity: -requiredQty } },
          { new: true }
        );

        if (!updated) {
          await rollbackStock(decremented);
          return res.status(409).json({ message: CONFIRM_OUT_OF_STOCK_MSG });
        }

        decremented.push({ id: productId, qty: requiredQty });
      }
    }

    // Update only status flags — avoid order.save(), which re-validates the full
    // document and can 500 on legacy/corrupt nested orderItems.
    const setFields = { orderStatus: "Confirmed" };
    if (!alreadyCommitted) {
      setFields.inventoryCommitted = true;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: setFields },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      await rollbackStock(decremented);
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order confirmed", order: updatedOrder });
  } catch (error) {
    console.error("[confirmOrder]", error);
    await rollbackStock(decremented);
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
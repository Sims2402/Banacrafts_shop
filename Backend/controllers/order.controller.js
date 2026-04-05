import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

/* @desc   Create new order
   @route  POST /api/orders
   @access Customer
*/
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

    // Calculate total price
    let totalPrice = 0;
    const items = [];
// new code
    for (const item of orderItems) {

  const product = await Product.findById(item.product);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // 🔴 CHECK STOCK
  if (item.quantity > product.quantity) {
    return res.status(400).json({
      message: `Only ${product.quantity} items available for ${product.name}`
    });
  }

  totalPrice += product.price * item.quantity;

  items.push({
    product: product._id,
    name: product.name,
    price: product.price,
    quantity: item.quantity
  });
}
/*
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
*/
    const order = await Order.create({
      user: req.user._id,
      orderItems: items,
      deliveryMethod,
      deliveryAddress,
      phone,
      paymentMethod,
      totalPrice,
      paymentStatus:"Pending"
    });
    // 🔴 REDUCE PRODUCT STOCK
for (const item of orderItems) {
  await Product.findByIdAndUpdate(
    item.product,
    { $inc: { quantity: -item.quantity } }
  );
}
const userEmail = req.user.email;
console.log("Sending email to:", req.user.email);
await sendEmail(
  userEmail,
  "Order Placed Successfully 🛍️",
  `
    <h2>Thank you for your order!</h2>
    <p>Your order has been placed successfully.</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <h3>Order Summary</h3>
<table border="1" cellpadding="5" cellspacing="0">
  <tr>
    <th>Product</th>
    <th>Qty</th>
  </tr>
  ${order.orderItems
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
      </tr>
    `
    )
    .join("")}
</table>
    <p><strong>Total:</strong> ₹${order.totalPrice}</p>
    <p>We will notify you once it is shipped.</p>
  `
);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* @desc   Get logged-in user's orders
   @route  GET /api/orders/my
   @access Customer
*/
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

/* @desc   Get orders for logged-in seller
   @route  GET /api/orders/seller
   @access Seller / Admin
*/
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price seller")
      .sort({ createdAt: -1 });

    // Filter orders containing seller's products
    const sellerOrders = orders.filter(order =>
      order.orderItems.some(
        item => item.product?.seller?.toString() === req.user._id.toString()
      )
    );

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Update order status
   @route  PUT /api/orders/:id/status
   @access Seller / Admin
*/
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Dispatched", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.json({
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* @desc   Request order cancellation
   @route  PUT /api/orders/:id/cancel
   @access Customer
*/
export const requestCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({
        message: "Order cannot be cancelled after dispatch"
      });
    }

    order.cancelRequested = true;
    order.cancelStatus = "Requested";

    await order.save();

    res.json({ message: "Cancellation requested", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* @desc   Seller approve/reject order cancellation
   @route  PUT /api/orders/:id/cancel/action
   @access Seller / Admin
*/
export const handleCancelAction = async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.cancelStatus !== "Requested") {
      return res.status(400).json({
        message: "No cancellation request for this order"
      });
    }

    if (action === "approve") {
      order.cancelStatus = "Approved";
      order.orderStatus = "Cancelled";
    } else {
      order.cancelStatus = "Rejected";
    }

    await order.save();

    res.json({
      message: `Cancellation ${action}d successfully`,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Request return or exchange
   @route  PUT /api/orders/:id/return
   @access Customer
*/
export const requestReturnOrExchange = async (req, res) => {
  try {
    const { type } = req.body; // "Return" or "Exchange"

    if (!["Return", "Exchange"].includes(type)) {
      return res.status(400).json({ message: "Invalid return type" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message: "Return/Exchange allowed only after delivery"
      });
    }

    order.returnRequested = true;
    order.returnType = type;
    order.returnStatus = "Requested";

    await order.save();

    res.json({
      message: `${type} requested successfully`,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Seller approve/reject return or exchange
   @route  PUT /api/orders/:id/return/action
   @access Seller / Admin
*/
export const handleReturnAction = async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.returnStatus !== "Requested") {
      return res.status(400).json({
        message: "No return/exchange request for this order"
      });
    }

    if (action === "approve") {
      order.returnStatus = "Approved";
    } else {
      order.returnStatus = "Rejected";
    }

    await order.save();

    res.json({
      message: `Return/Exchange ${action}d successfully`,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await Order.find();

    const order = orders.find((o) =>
      o._id.toString().slice(-6) === orderId
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
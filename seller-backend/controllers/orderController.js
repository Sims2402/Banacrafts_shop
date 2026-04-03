const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  try {

    const order = new Order(req.body);

    await order.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Orders table
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const orders = await Order.find()
      .populate("user")
      .populate("orderItems.product");
    console.log("CHECK PRODUCT:", orders[0]?.orderItems[0]?.product);
    const filteredOrders = orders
      .map(order => {
        const sellerItems = order.orderItems.filter(item =>
          item.product &&
          item.product.seller &&
          item.product.seller.toString() === sellerId
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
    res.status(500).json({ error: error.message });
  }
};

// Eye icon dialog
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "-password")
      .populate("orderItems.product");

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: "Confirmed" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.dispatchOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: "Dispatched" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Mark Delivered
exports.markOrderDelivered = async (req, res) => {

  try {

    const orderId = req.params.orderId;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "Delivered" },
      { new: true }
    );

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

//Approve Cancel Request
exports.approveCancelRequest = async (req, res) => {

  try {

    const orderId = req.params.orderId;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        cancelStatus: "Approved",
        cancelRequested: false,
        orderStatus: "Cancelled"
      },
      { new: true }
    );

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};

//Reject Cancel Request
exports.rejectCancelRequest = async (req, res) => {

  try {

    const orderId = req.params.orderId;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        cancelStatus: "Rejected",
        cancelRequested: false
      },
      { new: true }
    );

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// Approve Exchange Request
exports.approveExchangeRequest = async (req, res) => {

  try {

    const orderId = req.params.orderId;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        returnStatus: "Approved",
        returnRequested: false
      },
      { new: true }
    );

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// Reject Exchange Request
exports.rejectExchangeRequest = async (req, res) => {

  try {

    const orderId = req.params.orderId;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        returnStatus: "Rejected",
        returnRequested: false
      },
      { new: true }
    );

    res.status(200).json(order);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
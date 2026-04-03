const express = require("express");
const router = express.Router();

const {
  createOrder,
  getSellerOrders,
  getOrderDetails,
  markOrderDelivered,
  approveCancelRequest,
  rejectCancelRequest,
  approveExchangeRequest,
  rejectExchangeRequest,
  confirmOrder,        // added
  dispatchOrder        // added
} = require("../controllers/orderController");


//  CREATE ORDER
router.post("/seller/orders", createOrder);

//  GET ALL ORDERS FOR A SELLER
router.get("/seller/:sellerId", getSellerOrders);

//  GET ORDER DETAILS
router.get("/seller/orders/details/:orderId", getOrderDetails);


//  NEW STATUS ROUTES (MATCH FRONTEND)

// confirm
router.patch("/:orderId/confirm", confirmOrder);

// dispatch
router.patch("/:orderId/dispatch", dispatchOrder);

// deliver
router.patch("/:orderId/deliver", markOrderDelivered);


//  CUSTOMER REQUEST ACTIONS

// cancel
router.patch("/:orderId/cancel/approve", approveCancelRequest);
router.patch("/:orderId/cancel/reject", rejectCancelRequest);

// exchange
router.patch("/:orderId/exchange/approve", approveExchangeRequest);
router.patch("/:orderId/exchange/reject", rejectExchangeRequest);


module.exports = router;
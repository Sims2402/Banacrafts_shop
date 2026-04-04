const User = require("../models/User");
const Order = require("../models/Order");
const { buildMailer } = require("./mailer");

/**
 * Send order status notification to the customer. Fails silently (logs only).
 * @param {import("mongoose").Document | object} orderDoc - Order with optional populated user & products
 * @param {string} statusType - Human-readable status e.g. "Confirmed", "Dispatched", "Delivered"
 */
async function sendOrderStatusEmail(orderDoc, statusType) {
  try {
    if (!orderDoc) return;

    const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };

    let customerEmail = null;
    let customerName = "Customer";

    const u = order.user;
    if (u && typeof u === "object" && u.email) {
      customerEmail = String(u.email).trim();
      customerName = u.name ? String(u.name) : customerName;
    } else if (order.user) {
      const userRow = await User.findById(order.user)
        .select("name email")
        .lean();
      if (userRow?.email) {
        customerEmail = String(userRow.email).trim();
        customerName = userRow.name ? String(userRow.name) : customerName;
      }
    }

    if (!customerEmail) {
      console.warn("[order status email] no customer email", {
        orderId: order._id,
      });
      return;
    }

    const orderIdStr = String(order._id);
    const total = Number(order.totalPrice) || 0;
    const items = Array.isArray(order.orderItems) ? order.orderItems : [];

    const lines = items.map((item) => {
      const p = item.product;
      const name =
        p && typeof p === "object" && p.name ? String(p.name) : "Product";
      const qty = item.quantity != null ? Number(item.quantity) : 1;
      const unit =
        p && typeof p === "object" && typeof p.price === "number"
          ? p.price
          : null;
      let line = `  • ${name} × ${qty}`;
      if (unit != null && !Number.isNaN(unit)) {
        line += ` @ ₹${unit}`;
      }
      return line;
    });

    const summary = lines.length ? lines.join("\n") : "  (no items listed)";

    const appName = process.env.APP_NAME || "BanaCrafts";
    const shortId = orderIdStr.slice(-8);
    const subject = `${appName} – Order update: ${statusType} (#${shortId})`;

    const text = [
      `Hello ${customerName},`,
      ``,
      `Your order has been updated.`,
      ``,
      `Order ID: ${orderIdStr}`,
      `Updated status: ${statusType}`,
      ``,
      `Product summary:`,
      summary,
      ``,
      `Total amount: ₹${total.toLocaleString("en-IN")}`,
      ``,
      `Thank you for shopping with ${appName}.`,
    ].join("\n");

    const { transporter, from } = buildMailer();
    await transporter.sendMail({
      from,
      to: customerEmail,
      subject,
      text,
    });
  } catch (err) {
    console.error("[order status email] failed (silent)", {
      message: err?.message,
      orderId: orderDoc?._id,
      statusType,
    });
  }
}

/**
 * Load full order (user + products) and send email. Does not throw.
 */
function queueOrderStatusEmail(orderId, statusType) {
  if (!orderId) return;
  const id =
    typeof orderId === "string"
      ? orderId
      : orderId.toString?.() || String(orderId);
  Order.findById(id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .then((order) => {
      if (order) {
        return sendOrderStatusEmail(order, statusType);
      }
    })
    .catch((err) => {
      console.error("[queueOrderStatusEmail]", err?.message);
    });
}

module.exports = { sendOrderStatusEmail, queueOrderStatusEmail };

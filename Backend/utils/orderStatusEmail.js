import User from "../models/User.js";
import Order from "../models/Order.js";
import { buildMailer } from "./mailer.js";

export async function sendOrderStatusEmail(orderDoc, statusType) {
  try {
    if (!orderDoc) return;

    const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };

    let customerEmail = null;
    let customerName = "Customer";

    const u = order.user;

    if (u && typeof u === "object" && u.email) {
      customerEmail = String(u.email).trim();
      customerName = u.name || customerName;
    } else if (order.user) {
      const userRow = await User.findById(order.user)
        .select("name email")
        .lean();

      if (userRow?.email) {
        customerEmail = String(userRow.email).trim();
        customerName = userRow.name || customerName;
      }
    }

    if (!customerEmail) return;

    const orderIdStr = String(order._id);
    const total = Number(order.totalPrice) || 0;

    const items = Array.isArray(order.orderItems) ? order.orderItems : [];

    const summary = items.map(item => {
      const name = item.product?.name || "Product";
      const qty = item.quantity || 1;
      return `• ${name} × ${qty}`;
    }).join("\n");

    const { transporter, from } = buildMailer();

    await transporter.sendMail({
      from,
      to: customerEmail,
      subject: `Order ${statusType}`,
      text: `Hello ${customerName},

Your order is now ${statusType}.

Order ID: ${orderIdStr}

${summary}

Total: ₹${total}`
    });

  } catch (err) {
    console.error("Email failed:", err.message);
  }
}

export function queueOrderStatusEmail(orderId, statusType) {
  if (!orderId) return;

  Order.findById(orderId)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .then(order => {
      if (order) sendOrderStatusEmail(order, statusType);
    })
    .catch(err => {
      console.error("Queue email error:", err.message);
    });
}
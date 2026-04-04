/**
 * One-time: set paymentStatus to "Paid" for delivered COD orders still marked pending/unpaid/due.
 *
 * Usage (from seller-backend):
 *   node scripts/fixDeliveredCodPendingPayments.js
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Order = require("../models/Order");

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected.");

  const filter = {
    orderStatus: { $regex: /^delivered$/i },
    paymentStatus: { $regex: /^(pending|unpaid|due)$/i },
    $or: [
      { paymentMethod: { $regex: /^cash$/i } },
      { paymentMethod: { $regex: /^cod$/i } },
      { paymentMethod: { $regex: /cash on delivery/i } },
      { paymentMethod: "cash" },
      { paymentMethod: "COD" },
    ],
  };

  const before = await Order.countDocuments(filter);
  console.log(`Matching orders: ${before}`);

  const res = await Order.updateMany(filter, { $set: { paymentStatus: "Paid" } });
  console.log("Modified:", res.modifiedCount);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

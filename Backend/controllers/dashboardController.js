import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Dashboard Stats
export const getDashboardStats = async (req, res) => {

  try {

    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });

    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      "orderItems.product": { $in: productIds }
    });

    const totalProducts = products.length;
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    /** Weighted average from embedded product ratings (Product.rating × Product.numRatings) */
    let weightedSum = 0;
    let totalProductRatings = 0;
    products.forEach((p) => {
      const n = Number(p.numRatings) || 0;
      if (n > 0) {
        totalProductRatings += n;
        weightedSum += (Number(p.rating) || 0) * n;
      }
    });
    const avgProductRating = totalProductRatings
      ? Number((weightedSum / totalProductRatings).toFixed(1))
      : 0;

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalRevenue,
      avgProductRating,
      totalProductRatings,
      avgRating: avgProductRating,
      totalReviews: totalProductRatings,
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// Weekly revenue (last 4 weeks, Week 1 = oldest … Week 4 = most recent)
export const getRevenueStats = async (req, res) => {

  try {

    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });

    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      "orderItems.product": { $in: productIds }
    });

    const buckets = [0, 0, 0, 0];

    orders.forEach((order) => {
      const daysAgo =
        (Date.now() - new Date(order.createdAt).getTime()) / 86400000;
      if (daysAgo < 0 || daysAgo >= 28) return;
      const weekSlot = Math.min(3, Math.floor(daysAgo / 7));
      const chartIdx = 3 - weekSlot;
      buckets[chartIdx] += order.totalPrice || 0;
    });

    const revenue = buckets.map((rev, i) => ({
      name: `Week ${i + 1}`,
      revenue: rev,
    }));

    res.status(200).json({ revenue });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// Top Selling Products
export const getTopProducts = async (req, res) => {

  try {

    const sellerId = req.params.sellerId;

    const products = await Product.find({ seller: sellerId });

    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      "orderItems.product": { $in: productIds }
    }).populate("orderItems.product");

    const productSales = {};

    orders.forEach(order => {

      order.orderItems.forEach(item => {

        const prod = item.product;
        if (!prod || !prod._id) return;

        const productId = prod._id.toString();

        if (!productSales[productId]) {
          productSales[productId] = {
            name: prod.name || "Product",
            sold: 0
          };
        }

        productSales[productId].sold += item.quantity || 0;

      });

    });

    const topProducts = Object.values(productSales)
      .map((p) => ({ name: p.name, value: p.sold }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    res.status(200).json({ topProducts });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
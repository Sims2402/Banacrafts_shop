import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Discount from "../models/Discount.js";
import Awareness from "../models/Awareness.js";

/* =====================================================
   ADMIN STATS & DASHBOARD
===================================================== */

export const getAdminStats = async (req, res) => {
  try {

    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalRevenue,
      totalOrders,
      totalSellers,
      totalCustomers
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {

    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const monthlyRaw = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyRevenue = monthlyRaw.map(item => ({
      month: `${monthNames[item._id.month]} ${item._id.year}`,
      revenue: item.revenue
    }));

    const weeklyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $week: "$createdAt" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Product.aggregate([
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: "$title",
          value: "$sold"
        }
      }
    ]);

    res.json({
      stats: { totalRevenue, totalOrders, totalSellers, totalCustomers },
      monthlyRevenue,
      weeklyOrders,
      topProducts
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   AWARENESS MANAGEMENT
===================================================== */

/* GET ALL ARTICLES */

export const getAllArticles = async (req, res) => {
  try {

    const articles = await Awareness
      .find()
      .sort({ createdAt: -1 });

    res.json(articles);

  } catch (error) {
    console.error("Fetch Articles Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* GET SINGLE ARTICLE */

export const getSingleArticle = async (req, res) => {
  try {

    const article = await Awareness.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* CREATE ARTICLE */

export const createArticle = async (req, res) => {
  try {

    const { title, category, excerpt, content, image, readTime } = req.body;

    if (!title || !category || !excerpt || !content) {
      return res.status(400).json({
        message: "Title, category, excerpt and content are required"
      });
    }

    const article = new Awareness({
      title,
      category,
      excerpt,
      content,
      image: image || "",
      readTime: readTime || 5   // must be NUMBER
    });

    await article.save();

    res.status(201).json(article);

  } catch (error) {

    console.error("Create Article Error:", error);

    res.status(500).json({
      message: "Failed to create article",
      error: error.message
    });

  }
};


/* UPDATE ARTICLE */

export const updateArticle = async (req, res) => {
  try {

    const updatedArticle = await Awareness.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updatedArticle);

  } catch (error) {
    console.error("Update Article Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* DELETE ARTICLE */

export const deleteArticle = async (req, res) => {
  try {

    const article = await Awareness.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });

  } catch (error) {
    console.error("Delete Article Error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* =====================================================
   DISCOUNT MANAGEMENT
===================================================== */

export const createDiscount = async (req, res) => {
  try {

    const { code, label, type, value, scope, usageLimit, validFrom, validTill, createdBy } = req.body;

    if (!code || !label || !type || !value || !validFrom || !validTill) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Discount.findOne({ code });

    if (existing) {
      return res.status(400).json({ message: "Discount code already exists" });
    }

    const discount = await Discount.create({
      code,
      label,
      type,
      value,
      scope: scope || "site",
      usageLimit: usageLimit || 100,
      usedCount: 0,
      validFrom,
      validTill,
      createdBy: createdBy || "admin",
      isActive: true
    });

    res.status(201).json(discount);

  } catch (error) {
    console.error("Create Discount Error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getAllDiscounts = async (req, res) => {
  try {

    const discounts = await Discount
      .find()
      .sort({ createdAt: -1 });

    res.json(discounts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const toggleDiscountStatus = async (req, res) => {
  try {

    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    discount.isActive = !discount.isActive;

    await discount.save();

    res.json({
      message: "Discount status updated",
      discount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteDiscount = async (req, res) => {
  try {

    await Discount.findByIdAndDelete(req.params.id);

    res.json({ message: "Discount deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* =====================================================
   USER MANAGEMENT
===================================================== */

export const getAllUsers = async (req, res) => {
  try {

    const { role } = req.query;

    const filter = role && role !== "all"
      ? { role }
      : {};

    const users = await User
      .find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createUserByAdmin = async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* =====================================================
   ADMIN ORDERS
===================================================== */

export const getAllOrdersAdmin = async (req, res) => {
  try {

    const orders = await Order
      .find()
      .populate("user", "name email role")
      .populate("orderItems.product", "title seller")
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter(order => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const pendingPayments = orders
      .filter(order => order.paymentStatus !== "Paid")
      .reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      stats: {
        totalOrders,
        totalRevenue,
        pendingPayments
      },
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
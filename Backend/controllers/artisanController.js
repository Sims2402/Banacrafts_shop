const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Artisan = require("../models/Artisan");

function mapArtisansCollectionDoc(doc) {
  const sid = String(doc._id);
  return {
    id: sid,
    name: doc.name || doc.fullName || "Artisan",
    specialty:
      doc.specialty ||
      doc.category ||
      doc.craft ||
      doc.skill ||
      "Handmade products",
    experience: Math.max(0, Number(doc.experience) || 0),
    location: doc.location || doc.city || "",
    image: doc.image || doc.profilePicture || doc.photo || doc.avatar || "",
    bio: doc.bio || doc.description || doc.about || "",
    achievements: Array.isArray(doc.achievements) ? doc.achievements : [],
    productsCount: Math.max(0, Number(doc.productsCount) || 0),
  };
}

function mapSellerUserToArtisan(s, specialtyBySeller, countMap) {
  const sid = String(s._id);
  const joinedYear = s.createdAt
    ? new Date(s.createdAt).getFullYear()
    : new Date().getFullYear();
  const experience = Math.max(0, new Date().getFullYear() - joinedYear);

  return {
    id: sid,
    name: s.name || "Seller",
    specialty: specialtyBySeller[sid] || "Handmade products",
    experience,
    location: "",
    image: s.profilePicture || "",
    bio: "",
    achievements: [],
    productsCount: countMap[sid] || 0,
  };
}

/** Prefer dedicated `artisans` collection when it has documents; else derive from sellers + products. */
exports.getArtisans = async (req, res) => {
  try {
    const fromCollection = await Artisan.find({}).sort({ name: 1 }).lean();

    if (fromCollection.length > 0) {
      const list = fromCollection.map(mapArtisansCollectionDoc);
      return res.status(200).json(list);
    }

    const sellers = await User.find({ role: "seller" })
      .select("name profilePicture phone createdAt")
      .sort({ name: 1 })
      .lean();

    const counts = await Product.aggregate([
      { $group: { _id: "$seller", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[String(c._id)] = c.count;
    });

    const sellerObjectIds = sellers.map((s) => s._id);
    const firstCategoryBySeller = await Product.aggregate([
      { $match: { seller: { $in: sellerObjectIds } } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: "$seller", category: { $first: "$category" } } },
    ]);
    const specialtyBySeller = {};
    firstCategoryBySeller.forEach((row) => {
      if (row._id && row.category)
        specialtyBySeller[String(row._id)] = row.category;
    });

    const list = sellers.map((s) =>
      mapSellerUserToArtisan(s, specialtyBySeller, countMap)
    );

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArtisanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    const artisanDoc = await Artisan.findById(id).lean();
    if (artisanDoc) {
      return res.status(200).json({
        artisan: mapArtisansCollectionDoc(artisanDoc),
        products: [],
      });
    }

    const seller = await User.findOne({
      _id: id,
      role: "seller",
    })
      .select("name profilePicture phone createdAt")
      .lean();

    if (!seller) {
      return res.status(404).json({ error: "Not found" });
    }

    const products = await Product.find({ seller: seller._id }).lean();

    const joinedYear = seller.createdAt
      ? new Date(seller.createdAt).getFullYear()
      : new Date().getFullYear();
    const experience = Math.max(0, new Date().getFullYear() - joinedYear);

    const specialty =
      products.find((p) => p.category)?.category || "Handmade products";

    const artisan = {
      id: String(seller._id),
      name: seller.name || "Seller",
      specialty,
      experience,
      location: "",
      image: seller.profilePicture || "",
      bio: "",
      achievements: [],
      productsCount: products.length,
    };

    res.status(200).json({ artisan, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

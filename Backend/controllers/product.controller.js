import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import { getFinalPrice } from "../utils/priceCalculator.js";
import { parseProductTags } from "../utils/parseProductTags.js";
// ✅ ADD THESE (seller features)
import { enrichProductObject, enrichProductsWithPricing } from "../utils/priceCalculator.js";
// ================= CREATE PRODUCT =================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      material,
      category,
      tags,
      returnable,
      discountPercentage
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (req.body.quantity === undefined || req.body.quantity === "") {
      return res.status(400).json({ message: "quantity is required" });
    }
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "quantity must be a non-negative whole number"
      });
    }

    let uploadedImages = [];

    // CLOUDINARY MULTIPLE IMAGES
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.v2.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "banacrafts/products" }
        );

        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url
        });
      }
    }

    // SINGLE IMAGE SUPPORT (from second code)
    else if (req.file) {
      uploadedImages = [
        {
          url: req.file.path,
          public_id: req.file.filename
        }
      ];
    } else {
      return res.status(400).json({ message: "At least one image required" });
    }

    const parsedTags = parseProductTags(tags ?? req.body.tags);

    const priceNum = Number(price);
    const disc =
      discountPercentage != null && discountPercentage !== ""
        ? Number(discountPercentage)
        : 0;
    const orig =
      req.body.originalPrice != null && req.body.originalPrice !== ""
        ? Number(req.body.originalPrice)
        : undefined;

    const product = new Product({
      name,
      description,
      price: priceNum,
      material,
      category,
      tags: parsedTags,
      returnable: returnable !== false && returnable !== "false",
      discountPercentage: Number.isFinite(disc) && disc >= 0 ? disc : 0,
      originalPrice:
        orig !== undefined && Number.isFinite(orig) && orig >= 0 ? orig : undefined,
      quantity,
      images: uploadedImages,
      seller: req.user?._id || req.body.seller,
      ratings: [],
      numRatings: 0,
      rating: 0
    });

    await product.save();

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL =================
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    const updated = await Promise.all(
      products.map(async (p) => {
        const finalPrice = await getFinalPrice(p._id);
        return { ...p.toObject(), finalPrice };
      })
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET BY ID =================
export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const productDoc = await Product.findById(id)
      .populate("seller", "name email profilePicture role");

    if (!productDoc) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ USE seller enrichment (more complete)
const payload = await enrichProductObject(productDoc);
res.json(payload);

    res.json({
      ...productDoc.toObject(),
      finalPrice
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SELLER PRODUCTS =================
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId || req.user._id;

    const products = await Product.find({ seller: sellerId });

    // ✅ USE seller pricing system
const updatedProducts = await enrichProductsWithPricing(products);
res.status(200).json(updatedProducts);

    res.status(200).json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE =================
export const updateProduct = async (req, res) => {
  try {
    const {
      ratings: _r,
      rating: _avg,
      numRatings: _n,
      inStock: _i,
      available: _a,
      ...safeBody
    } = req.body;

    if (safeBody.quantity !== undefined) {
      const q = Number(safeBody.quantity);
      if (!Number.isInteger(q) || q < 0) {
        return res.status(400).json({
          message: "quantity must be a non-negative whole number"
        });
      }
      safeBody.quantity = q;
    }

    if (safeBody.tags !== undefined) {
      safeBody.tags = parseProductTags(safeBody.tags);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: safeBody },
      { new: true }
    );

    res.status(200).json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE =================
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RATING =================
export const submitProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, value } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const v = Number(value);
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      return res.status(400).json({ error: "Rating must be 1–5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (String(product.seller) === String(userId)) {
      return res.status(403).json({ error: "Cannot rate own product" });
    }

    const ratings = Array.isArray(product.ratings) ? [...product.ratings] : [];
    const idx = ratings.findIndex(r => String(r.user) === String(userId));

    const entry = { user: userId, value: Math.round(v) };

    if (idx >= 0) ratings[idx] = entry;
    else ratings.push(entry);

    const numRatings = ratings.length;
    const sum = ratings.reduce((s, r) => s + r.value, 0);
    const avg = numRatings ? Math.round((sum / numRatings) * 10) / 10 : 0;

    product.ratings = ratings;
    product.numRatings = numRatings;
    product.rating = avg;

    await product.save();

    const productDoc = await Product.findById(product._id)
      .populate("seller", "name profilePicture role");

    const finalPrice = await getFinalPrice(productDoc._id);

    res.status(200).json({
      ...productDoc.toObject(),
      finalPrice
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
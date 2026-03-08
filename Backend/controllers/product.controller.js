import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
/* @desc   Create new product
   @route  POST /api/products
   @access Seller / Admin
*/
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "banacrafts/products"
        }
      );

      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      material,
      category,
      tags: tags ? tags.split(",") : [],
      returnable,
      discountPercentage,
      images: uploadedImages,
      seller: req.user._id
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Get all products
   @route  GET /api/products
   @access Public
*/
export const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter = {
        name: { $regex: search, $options: "i" } // case-insensitive search
      };
    }

    const products = await Product.find(filter)
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Get single product by ID
   @route  GET /api/products/:id
   @access Public
*/


/* @desc   Get single product by ID
   @route  GET /api/products/:id
   @access Public
*/
export const getProductById = async (req, res) => {
  const { id } = req.params;

  // ✅ Step 1: Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(id)
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* @desc   Get products of logged-in seller
   @route  GET /api/products/seller/me
   @access Seller / Admin
*/
export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

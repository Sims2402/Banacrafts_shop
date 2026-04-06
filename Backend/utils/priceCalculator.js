import Product from "../models/Product.js";
import Discount from "../models/Discount.js";

// ================= CORE LOGIC =================
function computeFinalPrice(listPrice, discountDoc) {
  let p = Number(listPrice);
  if (!Number.isFinite(p)) p = 0;

  if (!discountDoc) return Math.max(p, 0);

  if (discountDoc.type === "percentage") {
    p -= (p * Number(discountDoc.value)) / 100;
  } else {
    p -= Number(discountDoc.value);
  }

  return Math.max(p, 0);
}

function discountToPublic(discountDoc) {
  if (!discountDoc) return null;

  return {
    code: discountDoc.code,
    type: discountDoc.type,
    value: Number(discountDoc.value),
  };
}

// ================= FIXED (ADMIN + SELLER MERGE) =================
async function findActiveDiscountForProduct(productId) {
  const now = new Date();

  return Discount.findOne({
    product: productId,
    $or: [{ active: true }, { isActive: true }], // ✅ ADMIN FIX
    validFrom: { $lte: now },
    $or: [
      { validUntil: { $gte: now } },  // ✅ ADMIN FIX
      { validTill: { $gte: now } }    // ✅ ADMIN FIX
    ]
  }).sort({ updatedAt: -1 });
}

// ================= SINGLE PRODUCT =================
export async function getProductPricing(productId) {
  const product = await Product.findById(productId).lean();

  if (!product) {
    return { price: 0, finalPrice: 0, discount: null };
  }

  const price = Number(product.price) || 0;

  const discountDoc = await findActiveDiscountForProduct(productId);
  const discount = discountDoc ? discountToPublic(discountDoc) : null;

  const finalPrice = computeFinalPrice(price, discountDoc);

  return { price, finalPrice, discount };
}

// ================= ENRICH SINGLE =================
export async function enrichProductObject(productDoc) {
  const plain =
    productDoc && typeof productDoc.toObject === "function"
      ? productDoc.toObject()
      : { ...productDoc };

  const price = Number(plain.price) || 0;

  const discountDoc = await findActiveDiscountForProduct(productDoc._id);
  const discount = discountDoc ? discountToPublic(discountDoc) : null;

  const finalPrice = computeFinalPrice(price, discountDoc);

  return { ...plain, price, finalPrice, discount };
}

// ================= ENRICH MULTIPLE =================
export async function enrichProductsWithPricing(productDocs) {
  if (!productDocs.length) return [];

  const ids = productDocs.map((p) => p._id);
  const now = new Date();

  const discounts = await Discount.find({
    product: { $in: ids },
    $or: [{ active: true }, { isActive: true }], // ✅ ADMIN FIX
    validFrom: { $lte: now },
    $or: [
      { validUntil: { $gte: now } },
      { validTill: { $gte: now } }
    ]
  }).sort({ updatedAt: -1 });

  const byProduct = new Map();

  for (const d of discounts) {
    const key = String(d.product);
    if (!byProduct.has(key)) {
      byProduct.set(key, d);
    }
  }

  return productDocs.map((p) => {
    const plain = typeof p.toObject === "function" ? p.toObject() : { ...p };

    const price = Number(plain.price) || 0;
    const discountDoc = byProduct.get(String(p._id)) || null;
    const discount = discountDoc ? discountToPublic(discountDoc) : null;

    const finalPrice = computeFinalPrice(price, discountDoc);

    return { ...plain, price, finalPrice, discount };
  });
}

// ================= SIMPLE FINAL PRICE =================
export async function getFinalPrice(productId) {
  const { finalPrice } = await getProductPricing(productId);
  return finalPrice;
}
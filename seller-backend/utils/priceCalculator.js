const Product = require("../models/Product");
const Discount = require("../models/Discount");

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

async function findActiveDiscountForProduct(productId) {
  const now = new Date();
  return Discount.findOne({
    product: productId,
    active: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  }).sort({ updatedAt: -1 });
}

/**
 * @returns {{ price: number, finalPrice: number, discount: { code: string, type: string, value: number } | null }}
 */
async function getProductPricing(productId) {
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

/** Attach pricing to an already-loaded product document (single discount query). */
async function enrichProductObject(productDoc) {
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

/** Batch: one query for discounts for many products. */
async function enrichProductsWithPricing(productDocs) {
  if (!productDocs.length) return [];

  const ids = productDocs.map((p) => p._id);
  const now = new Date();
  const discounts = await Discount.find({
    product: { $in: ids },
    active: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
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

async function getFinalPrice(productId) {
  const { finalPrice } = await getProductPricing(productId);
  return finalPrice;
}

module.exports = {
  getFinalPrice,
  getProductPricing,
  enrichProductObject,
  enrichProductsWithPricing,
  computeFinalPrice,
};

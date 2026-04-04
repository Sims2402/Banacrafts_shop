import Product from "../models/Product.js";
import Discount from "../models/Discount.js";

export const getFinalPrice = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) return 0;

  let finalPrice = Number(product.price);

  const discount = await Discount.findOne({
    product: productId,
    // support BOTH fields (important for your merge)
    $or: [{ active: true }, { isActive: true }],
    validFrom: { $lte: new Date() },
    $or: [
      { validUntil: { $gte: new Date() } },
      { validTill: { $gte: new Date() } }
    ]
  });

  if (!discount) return finalPrice;

  if (discount.type === "percentage") {
    finalPrice -= (finalPrice * Number(discount.value)) / 100;
  } else {
    finalPrice -= Number(discount.value);
  }

  return Math.max(finalPrice, 0);
};
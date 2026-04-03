const Product = require("../models/Product");
const Discount = require("../models/Discount");

const getFinalPrice = async (productId) => {

  const product = await Product.findById(productId);

  let finalPrice = Number(product.price);

  const discount = await Discount.findOne({
    product: productId,
    active: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });

  if (!discount) return finalPrice;

  if (discount.type === "percentage") {
    finalPrice -= (finalPrice * Number(discount.value)) / 100;
  } else {
    finalPrice -= Number(discount.value);
  }

  return Math.max(finalPrice, 0);
};

module.exports = { getFinalPrice };
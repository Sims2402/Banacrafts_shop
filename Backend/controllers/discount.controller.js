import Discount from "../models/Discount.js";

/* GET ALL */
export const getDiscounts = async (req, res) => {
  const discounts = await Discount.find();
  res.json(discounts);
};

/* CREATE */
export const createDiscount = async (req, res) => {
  const discount = await Discount.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.json(discount);
};

/* TOGGLE ACTIVE */
export const toggleDiscount = async (req, res) => {
  const discount = await Discount.findById(req.params.id);

  discount.isActive = !discount.isActive;
  await discount.save();

  res.json(discount);
};

/* DELETE */
export const deleteDiscount = async (req, res) => {
  await Discount.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

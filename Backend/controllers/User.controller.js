import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name cannot be empty." });

    const updateFields = { name: name.trim(), phone: phone || "", address: address || "" };
    if (avatar?.startsWith("data:image")) updateFields.avatar = avatar;

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, select: "-password" });
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone, address: updated.address, avatar: updated.avatar });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Fill both fields." });
    if (newPassword.length < 6) return res.status(400).json({ message: "Min 6 characters." });

    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ message: "Current password is incorrect." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed." });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
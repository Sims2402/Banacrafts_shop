import express from "express";
import Artisan from "../models/Artisan.js";

const router = express.Router();

// Get all artisans
router.get("/", async (req, res) => {
  try {
    const artisans = await Artisan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: artisans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single artisan
router.get("/:id", async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) return res.status(404).json({ success: false, message: "Artisan not found" });
    res.json({ success: true, data: artisan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add artisan
router.post("/", async (req, res) => {
  try {
    const artisan = new Artisan(req.body);
    const saved = await artisan.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update artisan
router.put("/:id", async (req, res) => {
  try {
    const updated = await Artisan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete artisan
router.delete("/:id", async (req, res) => {
  try {
    await Artisan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Artisan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
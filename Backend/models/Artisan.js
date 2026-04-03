import mongoose from "mongoose";

const artisanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  craft: { type: String, required: true },
  specialty: { type: String },
  location: { type: String, required: true },
  experience: { type: Number, required: true },
  description: { type: String },
  bio: { type: String },
  image: { type: String },
  productsCount: { type: Number, default: 0 },
  achievements: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model("Artisan", artisanSchema);
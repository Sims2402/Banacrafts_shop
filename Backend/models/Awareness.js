import mongoose from "mongoose";

const awarenessSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // from both
    excerpt: { type: String, default: "" },

    // both kept (important merge decision)
    description: { type: String, default: "" },

    content: { type: String, default: "" },

    image: { type: String, default: "" },

    category: { type: String, default: "General" },

    readTime: { type: Number, default: 3 },

    // extra fields from second schema
    publishedAt: { type: Date, default: Date.now },

    isPublished: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    strict: false // allows old/extra data safely
  }
);

// IMPORTANT: keep ONE model name
export default mongoose.model("Awareness", awarenessSchema);
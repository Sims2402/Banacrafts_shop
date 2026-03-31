import mongoose from "mongoose";

const awarenessSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    excerpt: {
      type: String,
      required: true
    },

    content: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      required: true
    },

    readTime: {
      type: Number,
      default: 3
    }

  },
  { timestamps: true }
);

export default mongoose.model("Awareness", awarenessSchema);
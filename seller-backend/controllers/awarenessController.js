const mongoose = require("mongoose");
const AwarenessArticle = require("../models/AwarenessArticle");

const toClientArticle = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const excerpt = o.excerpt || o.description || "";
  const content = o.content || "";
  return {
    id: String(o._id),
    title: o.title,
    excerpt:
      String(excerpt).trim() ||
      (String(content).trim()
        ? String(content).trim().slice(0, 220) +
          (String(content).trim().length > 220 ? "…" : "")
        : ""),
    content,
    image: o.image || "",
    category: o.category || "General",
    readTime: o.readTime || 1,
    publishedAt: o.publishedAt
      ? new Date(o.publishedAt).toISOString()
      : new Date().toISOString(),
  };
};

exports.getPublishedArticles = async (req, res) => {
  try {
    let articles = await AwarenessArticle.find({
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } },
      ],
    })
      .sort({ publishedAt: -1 })
      .lean();

    if (articles.length === 0) {
      articles = await AwarenessArticle.find({})
        .sort({ publishedAt: -1 })
        .limit(100)
        .lean();
    }

    res.status(200).json(articles.map((a) => toClientArticle(a)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublishedArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    let article = await AwarenessArticle.findOne({
      _id: id,
      isPublished: true,
    }).lean();

    if (!article) {
      article = await AwarenessArticle.findById(id).lean();
    }

    if (!article) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json(toClientArticle(article));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await AwarenessArticle.find()
      .sort({ publishedAt: -1 })
      .lean();

    res.status(200).json(articles.map((a) => toClientArticle(a)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      image,
      category,
      readTime,
      publishedAt,
    } = req.body;

    const wordCount = String(content || "").split(/\s+/).filter(Boolean).length;
    const derivedReadTime =
      readTime != null && Number(readTime) > 0
        ? Number(readTime)
        : Math.max(1, Math.ceil(wordCount / 200));

    const article = await AwarenessArticle.create({
      title,
      excerpt: excerpt || "",
      content: content || "",
      image: image || "",
      category: category || "General",
      readTime: derivedReadTime,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      isPublished: true,
    });

    res.status(201).json(toClientArticle(article));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    const article = await AwarenessArticle.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!article) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json(toClientArticle(article));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not found" });
    }

    const article = await AwarenessArticle.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

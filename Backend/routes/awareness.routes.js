import express from "express";
import Awareness from "../models/Awareness.js";

const router = express.Router();

/* GET ALL ARTICLES */

router.get("/", async (req, res) => {

  try {

    const articles = await Awareness
      .find()
      .sort({ createdAt: -1 });

    res.json(articles);

  }

  catch (error) {

    res.status(500).json({ message: error.message });

  }

});
/* ADD ARTICLE */

router.post("/", async (req, res) => {
  try {
    const newArticle = new Awareness(req.body);
    const saved = await newArticle.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


/* GET SINGLE ARTICLE */

router.get("/:id", async (req, res) => {

  try {

    const article = await Awareness.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);

  }

  catch (error) {

    res.status(500).json({ message: error.message });

  }

});

export default router;
const express = require("express");
const router = express.Router();
const {
  getPublishedArticles,
  getPublishedArticleById,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/awarenessController");

router.get("/manage/all", getAllArticles);
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);
router.get("/", getPublishedArticles);
router.get("/:id", getPublishedArticleById);

module.exports = router;

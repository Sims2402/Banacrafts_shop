const express = require("express");
const router = express.Router();
const {
  getArtisans,
  getArtisanById,
} = require("../controllers/artisanController");

router.get("/", getArtisans);
router.get("/:id", getArtisanById);

module.exports = router;

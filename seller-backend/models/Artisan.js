const mongoose = require("mongoose");

/**
 * Optional dedicated `artisans` collection (actual data may live here).
 * `strict: false` allows legacy/extra fields from imports or older documents.
 */
const artisanSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "artisans" }
);

module.exports = mongoose.model("Artisan", artisanSchema);

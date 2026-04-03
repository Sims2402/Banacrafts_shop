const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ✅ CONNECT CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ✅ STORAGE FOR PROFILE
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "banacrafts/profile",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

// ✅ MULTER
const uploadProfile = multer({ storage: profileStorage });

// ✅ EXPORT (VERY IMPORTANT)
module.exports = uploadProfile;
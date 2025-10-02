// config/multer.js
const multer = require("multer");
const path = require("path");

// Use memory storage instead of S3 streaming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage, // Use memory storage
  fileFilter: fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 15
  }
});

module.exports = upload;
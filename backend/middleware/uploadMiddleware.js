
const multer = require("multer");
const path = require("path");

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Allow only JPG, JPEG and PNG
const fileFilter = (req, file, callback) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png"];

  const extension = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
  ];

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    callback(null, true);
  } else {
    callback(
      new Error("Only JPG, JPEG and PNG images are allowed.")
    );
  }
};

// Configure upload limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB per photo
    files: 7, // Maximum 7 photos per request
  },
});

module.exports = upload;

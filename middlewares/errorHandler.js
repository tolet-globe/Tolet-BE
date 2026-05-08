const mongoose = require("mongoose");
const { ApiError } = require("../utils/ApiError.js");

const errorHandler = function (err, req, res, _) {
  let statusCode = err.statusCode || err.status || (err instanceof mongoose.Error ? 400 : 500);
  let message = err.message || "Something went wrong";

  // If it's a Multer error specifically related to file size
  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "image file size exceeded";
  }

  // If it's any other 413 error (like from body-parser)
  if (statusCode === 413 && !message) {
    message = "Request entity too large";
  }

  // Log the error for debugging
  console.error(`[Error Handler] ${statusCode} - ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  // Ensure we are sending a JSON response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

module.exports = { errorHandler };

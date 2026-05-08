const mongoose = require("mongoose");
const { ApiError } = require("../utils/ApiError.js");

const errorHandler = function (err, req, res, next) {
  let statusCode = err.statusCode || err.status || (err instanceof mongoose.Error ? 400 : 500);
  let message = err.message || "Something went wrong";

  // If it's a Multer error specifically related to file size
  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "image file size exceeded (Multer Limit)";
  }

  // If it's a body-parser limit error
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = `Request entity too large (Body-Parser Limit: ${err.limit} bytes)`;
  }

  // Final fallback for 413
  if (statusCode === 413 && (!message || message === "Something went wrong")) {
    message = "Request entity too large (Generic 413)";
  }

  // FORCE LOG TO PM2 (Direct stderr write)
  const logMessage = `\n[${new Date().toISOString()}] ERROR HANDLER: ${statusCode} - ${message} - URL: ${req.originalUrl} - Method: ${req.method}\n`;
  process.stderr.write(logMessage); 
  
  if (statusCode === 500 || (err.stack && process.env.NODE_ENV !== "production")) {
    process.stderr.write(err.stack + "\n");
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

const mongoose = require("mongoose");
const { ApiError } = require("../utils/ApiError.js");

const errorHandler = function (err, req, res, _) {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    let message = error.message || "Something went wrong";

    // Handle Multer errors
    if (error.name === "MulterError") {
      if (error.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        message = "image file size exceeded";
      } else {
        statusCode = 400;
      }
    }

    // Handle Express Body Parser 413 error
    if (error.status === 413 || error.statusCode === 413) {
      statusCode = 413;
      message = "image file size exceeded";
    }

    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "production" ? {} : { stack: error.stack }),
  };

  // Send error response
  return res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };

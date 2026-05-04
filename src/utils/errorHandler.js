// src/utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// src/middleware/errorMiddleware.js (Enhanced)
const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err.statusCode = 400;
    err.message = message;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid, try again';
    err.statusCode = 400;
    err.message = message;
  }

  // JWT expire error
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token is expired, try again';
    err.statusCode = 400;
    err.message = message;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    err.statusCode = 400;
    err.message = message;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

module.exports = errorMiddleware;

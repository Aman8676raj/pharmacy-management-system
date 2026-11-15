const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(
    res,
    404,
    `Resource not found: [${req.method}] ${req.originalUrl}`
  );
};

/**
 * Centralized global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Log error
  logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};


/**
 * Standardized Success Response Helper
 * @param {object} res - Express response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human readable message
 * @param {object|array|null} data - Payload data
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standardized Error Response Helper
 * @param {object} res - Express response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error description
 * @param {array|object|null} errors - Detailed validation or error items
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};

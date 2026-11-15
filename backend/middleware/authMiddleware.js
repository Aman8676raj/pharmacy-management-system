const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes: verify JWT from HttpOnly cookie or Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // Check HttpOnly cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback to Bearer token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Authentication required. No token provided.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'pharmacy_jwt_default_secret_key'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Your session has expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid authentication token.');
    }
    return errorResponse(res, 401, 'Authentication failed.');
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Permitted user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${roles.join(', ')}.`
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};

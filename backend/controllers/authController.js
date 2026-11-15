const authService = require('../services/authService');
const { setAuthCookie, clearAuthCookie } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Authenticate user & set token cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    setAuthCookie(res, token);

    return successResponse(res, 200, 'Login successful', {
      user,
      token, // Also return in data for optional API client convenience
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new user / initial admin setup
 * @route   POST /api/auth/register
 * @access  Restricted (Initial setup or Authenticated Admin)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const requestingUser = req.user || null;

    const { user, token, isInitialAdmin } = await authService.register(
      { name, email, password, role },
      requestingUser
    );

    // If initial admin setup, set cookie directly for instant login
    if (isInitialAdmin) {
      setAuthCookie(res, token);
    }

    const message = isInitialAdmin
      ? 'Initial admin account created successfully'
      : 'User registered successfully';

    return successResponse(res, 201, message, {
      user,
      token: isInitialAdmin ? token : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user details
 * @route   GET /api/auth/me
 * @access  Private (Authenticated users)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, 200, 'User profile retrieved successfully', {
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private / Public
 */
const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return successResponse(res, 200, 'Logout successful', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check system setup status (whether any admin exists)
 * @route   GET /api/auth/setup-status
 * @access  Public
 */
const getSetupStatus = async (req, res, next) => {
  try {
    const isInitial = await authService.isInitialSetup();
    return successResponse(res, 200, 'Setup status checked', {
      isInitialSetup: isInitial,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  logout,
  getSetupStatus,
};

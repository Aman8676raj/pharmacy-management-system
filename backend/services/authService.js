const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

class AuthService {
  /**
   * Check if any user exists in database
   */
  async isInitialSetup() {
    const count = await User.countDocuments();
    return count === 0;
  }

  /**
   * Authenticate user with email and password
   */
  async login(email, password) {
    // Explicitly select password since it has select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated. Please contact an administrator.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id, user.role);

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  /**
   * Register a new user
   * Restricted: allows registration without auth ONLY if no users exist (initial admin setup).
   * Otherwise requires requestingUser to have 'admin' role.
   */
  async register({ name, email, password, role = 'pharmacist' }, requestingUser = null) {
    const totalUsers = await User.countDocuments();

    // If users already exist, registration requires an authenticated admin
    if (totalUsers > 0) {
      if (!requestingUser || requestingUser.role !== 'admin') {
        const error = new Error('Unauthorized: Registration is restricted to system administrators.');
        error.statusCode = 403;
        throw error;
      }
    }

    // If this is the initial user, enforce role as 'admin'
    const finalRole = totalUsers === 0 ? 'admin' : role;

    // Check if email already in use
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('A user with this email address already exists.');
      error.statusCode = 400;
      throw error;
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: finalRole,
      isActive: true,
    });

    const token = generateToken(newUser._id, newUser.role);

    return {
      user: newUser.toSafeObject(),
      token,
      isInitialAdmin: totalUsers === 0,
    };
  }

  /**
   * Fetch user details by ID
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found');
      error.statusCode = 404;
      throw error;
    }

    return user.toSafeObject();
  }
}

module.exports = new AuthService();

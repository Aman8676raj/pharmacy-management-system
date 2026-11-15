import api from './api';

const authService = {
  /**
   * Log in user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user (Restricted to Admin or initial setup)
   * @param {Object} userData - { name, email, password, role }
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Check if system is in initial setup mode
   */
  async checkSetupStatus() {
    const response = await api.get('/auth/setup-status');
    return response.data;
  },
};

export default authService;


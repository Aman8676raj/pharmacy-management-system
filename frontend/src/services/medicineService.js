import api from './api';

const medicineService = {
  /**
   * Get paginated medicines with filters
   */
  async getMedicines(params = {}) {
    const response = await api.get('/medicines', { params });
    return response.data;
  },

  /**
   * Search medicines by query string
   */
  async searchMedicines(query) {
    const response = await api.get('/medicines/search', { params: { q: query } });
    return response.data;
  },

  /**
   * Get single medicine details by ID
   */
  async getMedicineById(id) {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Add a new medicine
   */
  async createMedicine(medicineData) {
    const response = await api.post('/medicines', medicineData);
    return response.data;
  },

  /**
   * Update an existing medicine
   */
  async updateMedicine(id, medicineData) {
    const response = await api.put(`/medicines/${id}`, medicineData);
    return response.data;
  },

  /**
   * Deactivate a medicine (soft delete)
   */
  async deactivateMedicine(id) {
    const response = await api.delete(`/medicines/${id}`);
    return response.data;
  },

  /**
   * Get dynamic category and manufacturer filter options
   */
  async getFilterOptions() {
    const response = await api.get('/medicines/filter-options');
    return response.data;
  },

  /**
   * Get aggregate statistics for Dashboard and metrics
   */
  async getMedicineStats() {
    const response = await api.get('/medicines/stats');
    return response.data;
  },
};

export default medicineService;


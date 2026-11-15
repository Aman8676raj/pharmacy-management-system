import api from './api';

const supplierService = {
  /**
   * Get paginated suppliers with filters
   */
  async getSuppliers(params = {}) {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  /**
   * Get supplier statistics
   */
  async getSupplierStats() {
    const response = await api.get('/suppliers/stats');
    return response.data;
  },

  /**
   * Get single supplier details by ID with purchase history
   */
  async getSupplierById(id) {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData) {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  /**
   * Update an existing supplier
   */
  async updateSupplier(id, supplierData) {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  /**
   * Deactivate supplier
   */
  async deactivateSupplier(id) {
    const response = await api.patch(`/suppliers/${id}/deactivate`);
    return response.data;
  },

  /**
   * Reactivate supplier
   */
  async activateSupplier(id) {
    const response = await api.patch(`/suppliers/${id}/activate`);
    return response.data;
  },
};

export default supplierService;

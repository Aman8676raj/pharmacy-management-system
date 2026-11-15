import api from './api';

const customerService = {
  async getCustomers(params = {}) {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  async getCustomerStats() {
    const response = await api.get('/customers/stats');
    return response.data;
  },

  async searchCustomers(q) {
    const response = await api.get('/customers/search', { params: { q } });
    return response.data;
  },

  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(customerData) {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  async updateCustomer(id, customerData) {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  async activateCustomer(id) {
    const response = await api.patch(`/customers/${id}/activate`);
    return response.data;
  },

  async deactivateCustomer(id) {
    const response = await api.patch(`/customers/${id}/deactivate`);
    return response.data;
  },

  async getCustomerSales(id, params = {}) {
    const response = await api.get(`/customers/${id}/sales`, { params });
    return response.data;
  },

  async getCustomerPrescriptions(id, params = {}) {
    const response = await api.get(`/customers/${id}/prescriptions`, { params });
    return response.data;
  },
};

export default customerService;

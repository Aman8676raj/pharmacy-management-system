import api from './api';

const purchaseService = {
  /**
   * Get paginated purchase orders with filters
   */
  async getPurchases(params = {}) {
    const response = await api.get('/purchases', { params });
    return response.data;
  },

  /**
   * Get purchase order statistics
   */
  async getPurchaseStats() {
    const response = await api.get('/purchases/stats');
    return response.data;
  },

  /**
   * Get single purchase order by ID
   */
  async getPurchaseById(id) {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  /**
   * Create new purchase order (draft or ordered)
   */
  async createPurchaseOrder(purchaseData) {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },

  /**
   * Update draft purchase order
   */
  async updatePurchaseOrder(id, purchaseData) {
    const response = await api.put(`/purchases/${id}`, purchaseData);
    return response.data;
  },

  /**
   * Mark draft purchase order as ordered
   */
  async markAsOrdered(id) {
    const response = await api.patch(`/purchases/${id}/order`);
    return response.data;
  },

  /**
   * Receive stock for purchase order
   */
  async receiveStock(id, receivingData) {
    const response = await api.post(`/purchases/${id}/receive`, receivingData);
    return response.data;
  },

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id, reason = '') {
    const response = await api.patch(`/purchases/${id}/cancel`, { reason });
    return response.data;
  },
};

export default purchaseService;

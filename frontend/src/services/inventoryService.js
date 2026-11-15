import api from './api';

const inventoryService = {
  /**
   * Get paginated inventory batches
   */
  async getInventory(params = {}) {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  /**
   * Get overall inventory summary statistics
   */
  async getInventorySummary() {
    const response = await api.get('/inventory/summary');
    return response.data;
  },

  /**
   * Get single batch details and its transaction history
   */
  async getBatchById(id) {
    const response = await api.get(`/inventory/batches/${id}`);
    return response.data;
  },

  /**
   * List all batches for a specific medicine
   */
  async getMedicineBatches(medicineId) {
    const response = await api.get(`/inventory/medicines/${medicineId}/batches`);
    return response.data;
  },

  /**
   * Add stock (stock-in) to a new or existing batch
   */
  async stockIn(stockData) {
    const response = await api.post('/inventory/stock-in', stockData);
    return response.data;
  },

  /**
   * Adjust batch quantity
   */
  async adjustBatch(id, adjustmentData) {
    const response = await api.patch(`/inventory/batches/${id}/adjust`, adjustmentData);
    return response.data;
  },

  /**
   * Quarantine a batch
   */
  async quarantineBatch(id, reasonData) {
    const response = await api.patch(`/inventory/batches/${id}/quarantine`, reasonData);
    return response.data;
  },

  /**
   * Release a batch from quarantine
   */
  async releaseBatch(id, reasonData) {
    const response = await api.patch(`/inventory/batches/${id}/release`, reasonData);
    return response.data;
  },

  /**
   * Get list of low-stock medicines
   */
  async getLowStockMedicines() {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },

  /**
   * Get batches expiring within threshold (default 90 days)
   */
  async getExpiringBatches(days = 90) {
    const response = await api.get('/inventory/expiring', { params: { days } });
    return response.data;
  },

  /**
   * Get list of expired batches
   */
  async getExpiredBatches() {
    const response = await api.get('/inventory/expired');
    return response.data;
  },

  /**
   * Get inventory stock movement transactions
   */
  async getTransactions(params = {}) {
    const response = await api.get('/inventory/transactions', { params });
    return response.data;
  },

  /**
   * Preview FEFO allocation for a medicine
   */
  async previewFEFO(medicineId, quantity) {
    const response = await api.post('/inventory/fefo-preview', { medicineId, quantity });
    return response.data;
  },
};

export default inventoryService;


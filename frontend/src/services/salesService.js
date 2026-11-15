import api from './api';

const salesService = {
  /**
   * Get paginated sales listing with filters
   */
  async getSales(params = {}) {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  /**
   * Get sales statistics for dashboard and summaries
   */
  async getSaleStats(params = {}) {
    const response = await api.get('/sales/stats', { params });
    return response.data;
  },

  /**
   * Get single sale by ID
   */
  async getSaleById(id) {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  /**
   * Get single sale by invoice number
   */
  async getSaleByInvoice(invoiceNumber) {
    const response = await api.get(`/sales/invoice/${invoiceNumber}`);
    return response.data;
  },

  /**
   * Create POS sale checkout
   */
  async createSale(saleData) {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  /**
   * Record subsequent balance payment
   */
  async recordPayment(id, paymentData) {
    const response = await api.post(`/sales/${id}/payments`, paymentData);
    return response.data;
  },

  /**
   * Cancel sale (Admin only)
   */
  async cancelSale(id, reason) {
    const response = await api.patch(`/sales/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get profit analytics for a sale
   */
  async getSaleProfit(id) {
    const response = await api.get(`/sales/${id}/profit`);
    return response.data;
  },

  /**
   * Download / View PDF Invoice
   */
  async downloadInvoicePDF(id, invoiceNumber = 'invoice') {
    const response = await api.get(`/sales/${id}/invoice`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default salesService;

import api from './api';

const reportService = {
  /**
   * Get high-level executive dashboard statistics
   */
  async getDashboardStats() {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  /**
   * Get sales report with filters (startDate, endDate, paymentMethod, paymentStatus)
   */
  async getSalesReport(params = {}) {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  /**
   * Get inventory stock valuation, expiry analysis & movements
   */
  async getInventoryReport(params = {}) {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },

  /**
   * Get procurement and purchase report
   */
  async getPurchaseReport(params = {}) {
    const response = await api.get('/reports/purchases', { params });
    return response.data;
  },

  /**
   * Get Profit & Loss report (Revenue, COGS, Gross Profit)
   */
  async getProfitLossReport(params = {}) {
    const response = await api.get('/reports/profit-loss', { params });
    return response.data;
  },

  /**
   * Get medicine sales performance analytics (bestsellers, slow moving, margins)
   */
  async getMedicinePerformanceReport(params = {}) {
    const response = await api.get('/reports/medicines', { params });
    return response.data;
  },

  /**
   * Get customer retention & spending analytics
   */
  async getCustomerReport(params = {}) {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  },

  /**
   * Download CSV export
   */
  async downloadCSV(type, params = {}) {
    const response = await api.get('/reports/export/csv', {
      params: { type, ...params },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PharmaCore-${type}-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Download PDF export
   */
  async downloadPDF(type, params = {}) {
    const response = await api.get('/reports/export/pdf', {
      params: { type, ...params },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PharmaCore-${type}-report-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;


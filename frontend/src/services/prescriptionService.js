import api from './api';

const prescriptionService = {
  async getPrescriptions(params = {}) {
    const response = await api.get('/prescriptions', { params });
    return response.data;
  },

  async getPrescriptionById(id) {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  async createPrescription(prescriptionData) {
    const response = await api.post('/prescriptions', prescriptionData);
    return response.data;
  },

  async updatePrescription(id, prescriptionData) {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  },

  async uploadPrescriptionFile(id, formData) {
    const response = await api.post(`/prescriptions/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async verifyPrescription(id, verificationNotes) {
    const response = await api.patch(`/prescriptions/${id}/verify`, { verificationNotes });
    return response.data;
  },

  async rejectPrescription(id, rejectionReason) {
    const response = await api.patch(`/prescriptions/${id}/reject`, { rejectionReason });
    return response.data;
  },

  getPrescriptionFileUrl(id) {
    return `/api/prescriptions/${id}/file`;
  },
};

export default prescriptionService;


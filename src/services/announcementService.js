import api from './api';

const announcementService = {
  // Public endpoints
  async getAll() {
    const response = await api.get('/announcements');
    return response.data;
  },

  async getOne(id) {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  // Admin endpoints
  async getAllForAdmin() {
    const response = await api.get('/announcements/admin/all');
    return response.data;
  },

  async create(announcementData) {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  async createWithFile(formData) {
    const response = await api.post('/announcements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id, announcementData) {
    const response = await api.patch(`/announcements/${id}`, announcementData);
    return response.data;
  },

  async updateWithFile(id, formData) {
    const response = await api.patch(`/announcements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async toggleActive(id) {
    const response = await api.patch(`/announcements/${id}/toggle-active`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

export default announcementService;

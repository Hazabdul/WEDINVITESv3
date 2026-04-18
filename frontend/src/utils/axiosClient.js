/**
 * Axios-based API Client for wedding invitations app
 * Optional: Use this instead of fetch-based api.js if you prefer axios
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

class APIClient {
  // Auth endpoints
  static async login(email, password) {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  }

  static async getMe() {
    return axiosInstance.get('/api/auth/me');
  }

  // Invitation endpoints
  static async createInvitation(data) {
    return axiosInstance.post('/api/invitations', data);
  }

  static async getInvitations() {
    return axiosInstance.get('/api/invitations');
  }

  static async getInvitation(id) {
    return axiosInstance.get(`/api/invitations/${id}`);
  }

  static async updateInvitation(id, data) {
    return axiosInstance.put(`/api/invitations/${id}`, data);
  }

  static async deleteInvitation(id) {
    return axiosInstance.delete(`/api/invitations/${id}`);
  }

  // Upload endpoints
  static async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Public endpoints
  static async getPublicInvitation(slug) {
    return axiosInstance.get(`/api/public/invitations/${slug}`);
  }

  static async submitRSVP(id, data) {
    return axiosInstance.post(`/api/public/rsvp/${id}`, data);
  }

  // Order endpoints
  static async createOrder(data) {
    return axiosInstance.post('/api/orders', data);
  }

  static async getOrders() {
    return axiosInstance.get('/api/orders');
  }

  // Meta endpoints
  static async getSiteConfig() {
    return axiosInstance.get('/api/config');
  }

  static async updateSiteConfig(data) {
    return axiosInstance.put('/api/config', data);
  }
}

export default APIClient;

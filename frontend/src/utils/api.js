/**
 * API Client for wedding invitations app
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'https://wedinvitesv3.onrender.com';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/';
        }
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && /Failed to fetch/i.test(error.message)) {
        const networkError = new Error(`Could not reach API at ${url}. Start the backend server or update VITE_API_BASE_URL.`);
        console.error('API Request Error:', networkError);
        throw networkError;
      }
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Health endpoint (no /api prefix)
  async getHealth() {
    const baseUrl = `${this.baseURL}/health`;
    const url = `${baseUrl}?t=${Date.now()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          ...this.getHeaders(),
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && /Failed to fetch/i.test(error.message)) {
        const networkError = new Error(`Could not reach API at ${url}. Start the backend server or update VITE_API_BASE_URL.`);
        console.error('API Request Error:', networkError);
        throw networkError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/api/auth/me', {
      method: 'GET',
    });
  }

  // Invitation endpoints
  async createInvitation(data) {
    return this.request('/api/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInvitations() {
    return this.request('/api/invitations', {
      method: 'GET',
    });
  }

  async getInvitation(id) {
    return this.request(`/api/invitations/${id}`, {
      method: 'GET',
    });
  }

  async updateInvitation(id, data) {
    return this.request(`/api/invitations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async publishInvitation(id) {
    return this.request(`/api/invitations/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishInvitation(id) {
    return this.request(`/api/invitations/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async deleteInvitation(id) {
    return this.request(`/api/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || 'File upload failed.');
    }

    return payload;
  }

  async analyzeInvitation(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseURL}/api/analyze-invitation`, {
      method: 'POST',
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : undefined,
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || 'Invitation analysis failed.');
    }

    return payload;
  }

  async generateInvitationTemplates(data) {
    return this.request('/api/generate-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateWebsiteFromImage(file, instructions = '') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('instructions', instructions);

    const response = await fetch(`${this.baseURL}/api/image-to-website`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || 'Image-to-website generation failed.');
    }

    return payload;
  }

  // Public endpoints
  async getPublicInvitation(slug) {
    return this.request(`/api/public/invitations/${slug}`, {
      method: 'GET',
    });
  }

  async getPublishedInvitations(page = 1, limit = 6) {
    return this.request(`/api/public/invitations?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async submitRSVP(slug, data) {
    return this.request(`/api/public/invitations/${slug}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Order endpoints
  async createOrder(data) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders() {
    return this.request('/api/orders', {
      method: 'GET',
    });
  }

  // Meta endpoints
  async getSiteConfig() {
    return this.request('/api/config', {
      method: 'GET',
    });
  }

  async updateSiteConfig(data) {
    return this.request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;

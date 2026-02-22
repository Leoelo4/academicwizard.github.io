// API Configuration and Utility Functions
const API_BASE_URL = 'http://localhost:5000/api';

// API Utility Class
class API {
  // Get auth token from localStorage
  static getToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token
  static removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  // Get user data
  static getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Set user data
  static setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Make API request
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(email, password, role) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
      this.setUserData(data.data);
    }

    return data;
  }

  static async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (data.success && data.data.token) {
      this.setToken(data.data.token);
      this.setUserData(data.data);
    }

    return data;
  }

  static async getCurrentUser() {
    return await this.request('/auth/me');
  }

  static logout() {
    this.removeToken();
    window.location.href = 'index.html';
  }

  // Booking endpoints
  static async createBooking(bookingData) {
    return await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  static async getBookings() {
    return await this.request('/bookings');
  }

  static async getBooking(id) {
    return await this.request(`/bookings/${id}`);
  }

  static async updateBooking(id, updateData) {
    return await this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async cancelBooking(id) {
    return await this.request(`/bookings/${id}`, {
      method: 'DELETE'
    });
  }

  // Resource endpoints
  static async getResources(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/resources?${queryParams}` : '/resources';
    return await this.request(endpoint);
  }

  static async trackResourceDownload(id) {
    return await this.request(`/resources/${id}/download`, {
      method: 'POST'
    });
  }
}

// Show loading spinner
function showLoading(button) {
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span>Loading...</span>';
  }
}

// Hide loading spinner
function hideLoading(button) {
  if (button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

// Show error message
function showError(message, containerId = 'error-message') {
  const container = document.getElementById(containerId);
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
    container.className = 'error-message';
  } else {
    alert(message);
  }
}

// Show success message
function showSuccess(message, containerId = 'success-message') {
  const container = document.getElementById(containerId);
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
    container.className = 'success-message';
  } else {
    alert(message);
  }
}

// Update UI based on authentication state
function updateAuthUI() {
  const userData = API.getUserData();
  const loginBtn = document.querySelector('a[href="login.html"]');
  
  if (userData && loginBtn) {
    // User is logged in - show user info
    loginBtn.textContent = userData.name;
    loginBtn.href = '#';
    loginBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm('Do you want to logout?')) {
        API.logout();
      }
    };
  }
}

// Initialize auth UI on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
  updateAuthUI();
}

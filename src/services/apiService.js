// API Service for backend communication
class ApiService {
  static baseUrl = 'https://insidelab.up.railway.app/api/v1';
  static authToken = null;

  // Token management
  static setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  static getAuthToken() {
    if (this.authToken) return this.authToken;
    this.authToken = localStorage.getItem('auth_token');
    return this.authToken;
  }

  static clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  // HTTP headers
  static getHeaders(requireAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic HTTP methods
  static async get(endpoint, requireAuth = false) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(requireAuth),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async post(endpoint, data, requireAuth = false) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(requireAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async put(endpoint, data, requireAuth = false) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(requireAuth),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }
}

// Custom exception for API errors
class ApiException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiException';
  }
}

export { ApiService, ApiException };
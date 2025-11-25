// API Service for backend communication
class ApiService {
  static baseUrl = 'https://insidelab.up.railway.app/api/v1';
  static authToken = null;
  static refreshToken = null;
  static isRefreshing = false;
  static refreshSubscribers = [];

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

  static setRefreshToken(token) {
    this.refreshToken = token;
    localStorage.setItem('refresh_token', token);
  }

  static getRefreshToken() {
    if (this.refreshToken) return this.refreshToken;
    this.refreshToken = localStorage.getItem('refresh_token');
    return this.refreshToken;
  }

  static clearAuthToken() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
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

  // Refresh access token using refresh token
  static async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.access) {
        this.setAuthToken(data.access);
        return data.access;
      }

      throw new Error('No access token in refresh response');
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuthToken();
      throw error;
    }
  }

  // Handle token refresh with queue
  static async handleTokenRefresh() {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        const newToken = await this.refreshAccessToken();
        this.refreshSubscribers.forEach(callback => callback(newToken));
        this.refreshSubscribers = [];
        return newToken;
      } catch (error) {
        this.refreshSubscribers.forEach(callback => callback(null));
        this.refreshSubscribers = [];
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    // If already refreshing, wait for the result
    return new Promise((resolve) => {
      this.refreshSubscribers.push((token) => {
        resolve(token);
      });
    });
  }

  // Generic fetch with token refresh retry
  static async fetchWithAuth(url, options, requireAuth = false) {
    try {
      const response = await fetch(url, options);

      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && requireAuth && this.getRefreshToken()) {
        console.log('Token expired, attempting refresh...');

        try {
          const newToken = await this.handleTokenRefresh();

          if (newToken) {
            // Retry the original request with new token
            options.headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, options);
            return retryResponse;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Let the original 401 response be handled
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generic HTTP methods
  static async get(endpoint, requireAuth = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'GET',
      headers: this.getHeaders(requireAuth),
    };

    const response = await this.fetchWithAuth(url, options, requireAuth);

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async post(endpoint, data, requireAuth = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'POST',
      headers: this.getHeaders(requireAuth),
      body: JSON.stringify(data),
    };

    const response = await this.fetchWithAuth(url, options, requireAuth);

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async put(endpoint, data, requireAuth = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'PUT',
      headers: this.getHeaders(requireAuth),
      body: JSON.stringify(data),
    };

    const response = await this.fetchWithAuth(url, options, requireAuth);

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async patch(endpoint, data, requireAuth = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'PATCH',
      headers: this.getHeaders(requireAuth),
      body: JSON.stringify(data),
    };

    const response = await this.fetchWithAuth(url, options, requireAuth);

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    return response.json();
  }

  static async delete(endpoint, requireAuth = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'DELETE',
      headers: this.getHeaders(requireAuth),
    };

    const response = await this.fetchWithAuth(url, options, requireAuth);

    if (!response.ok) {
      const errorData = await response.text();
      throw new ApiException(response.status, errorData);
    }

    // DELETE may return empty response
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  // Lab Interest API methods
  static async addLabInterest(labId) {
    try {
      const response = await this.post('/auth/lab-interests/', { lab: labId }, true);
      return response;
    } catch (error) {
      console.error('Error adding lab interest:', error);
      throw error;
    }
  }

  static async removeLabInterest(labId) {
    try {
      const response = await this.post('/auth/lab-interests/remove_interest/', { lab: labId }, true);
      return response;
    } catch (error) {
      console.error('Error removing lab interest:', error);
      throw error;
    }
  }

  static async getLabInterests() {
    try {
      const response = await this.get('/auth/lab-interests/', true);
      return response;
    } catch (error) {
      console.error('Error fetching lab interests:', error);
      throw error;
    }
  }

  // Email and Username validation methods
  static async checkEmailAvailability(email) {
    try {
      const response = await this.post('/auth/check-email/', { email }, false);
      return response;
    } catch (error) {
      console.error('Error checking email availability:', error);
      throw error;
    }
  }

  static async checkUsernameAvailability(username) {
    try {
      const response = await this.post('/auth/check-username/', { username }, false);
      return response;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
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
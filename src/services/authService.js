// Auth Service for authentication operations
import { ApiService } from './apiService';

class AuthService {
  // User data management
  static setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }

  static getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  static clearUserData() {
    localStorage.removeItem('user_data');
  }

  static async login(email, password) {
    console.log('DEBUG: Attempting login for email:', email);

    const response = await ApiService.post('/auth/login/', {
      email,
      password,
    });

    console.log('DEBUG: Login response:', response);

    // Handle different response formats
    let accessToken = response.access ||
                     response.access_token ||
                     response.token ||
                     response.jwt ||
                     response.auth_token;

    let refreshToken = response.refresh || response.refresh_token;

    let userData = response.user || response.data || response;

    if (accessToken) {
      ApiService.setAuthToken(accessToken);
      console.log('DEBUG: Access token saved successfully');

      // Save refresh token if available
      if (refreshToken) {
        ApiService.setRefreshToken(refreshToken);
        console.log('DEBUG: Refresh token saved successfully');
      }

      // Save user data to localStorage
      if (userData) {
        this.setUserData(userData);
        console.log('DEBUG: User data saved to localStorage');
      }
    } else {
      console.log('DEBUG: No access token found in response');
      throw new Error('No access token received from server');
    }

    return {
      access: accessToken,
      refresh: refreshToken,
      user: userData,
    };
  }

  static async register(userData) {
    console.log('DEBUG: Attempting registration for user:', userData.email);

    const response = await ApiService.post('/auth/register/', userData);
    console.log('DEBUG: Registration successful:', response);
    return response;
  }

  static async logout() {
    ApiService.clearAuthToken();
    this.clearUserData();

    // Redirect to home and refresh the page
    window.location.href = '/';
  }

  static async getCurrentUser(useCache = true) {
    // If using cache and user data exists in localStorage, return it immediately
    if (useCache) {
      const cachedUser = this.getUserData();
      if (cachedUser) {
        console.log('DEBUG: Returning cached user data');

        // Update user data in background
        this.updateUserDataInBackground();

        return cachedUser;
      }
    }

    try {
      console.log('DEBUG: Fetching current user from /auth/user/');
      const response = await ApiService.get('/auth/user/', true);
      console.log('DEBUG: Current user response:', response);

      // Save updated user data to localStorage
      if (response) {
        this.setUserData(response);
      }

      return response;
    } catch (e) {
      console.log('DEBUG: Error fetching current user:', e);
      return null;
    }
  }

  // Update user data in background without affecting UI
  static async updateUserDataInBackground() {
    try {
      const response = await ApiService.get('/auth/user/', true);
      if (response) {
        this.setUserData(response);
        console.log('DEBUG: User data updated in background');
      }
    } catch (e) {
      console.log('DEBUG: Background user update failed:', e);
    }
  }

  static async verifyToken() {
    try {
      const token = ApiService.getAuthToken();
      if (!token) return false;

      console.log('DEBUG: Verifying token...');
      await ApiService.get('/auth/verify-token/', true);
      console.log('DEBUG: Token is valid');
      return true;
    } catch (e) {
      console.log('DEBUG: Token verification failed:', e);
      ApiService.clearAuthToken();
      return false;
    }
  }

  static isAuthenticated() {
    const token = ApiService.getAuthToken();
    return !!token;
  }


  // Update user profile
  static async updateProfile(profileData) {
    console.log('DEBUG: Updating user profile:', profileData);

    const response = await ApiService.put('/auth/profile/', profileData, true);
    console.log('DEBUG: Profile updated successfully:', response);

    // Update cached user data
    if (response) {
      this.setUserData(response);
    }

    return response;
  }

  // Google Sign In
  static async signInWithGoogle(idToken, email, displayName) {
    console.log('DEBUG: Google Sign-In with backend sync');

    const response = await ApiService.post('/auth/google/', {
      id_token: idToken,
      email,
      name: displayName,
    });

    // Save backend auth tokens
    if (response.access) {
      ApiService.setAuthToken(response.access);
    }

    if (response.refresh) {
      ApiService.setRefreshToken(response.refresh);
    }

    // Save user data to localStorage
    if (response.user) {
      this.setUserData(response.user);
    }

    return response;
  }
}

export { AuthService };
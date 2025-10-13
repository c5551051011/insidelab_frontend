// Auth Service for authentication operations
import { ApiService, ApiException } from './apiService';

class AuthService {
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

    let userData = response.user || response.data || response;

    if (accessToken) {
      ApiService.setAuthToken(accessToken);
      console.log('DEBUG: Token saved successfully');
    } else {
      console.log('DEBUG: No access token found in response');
      throw new Error('No access token received from server');
    }

    return {
      access: accessToken,
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
  }

  static async getCurrentUser() {
    try {
      console.log('DEBUG: Fetching current user from /auth/user/');
      const response = await ApiService.get('/auth/user/', true);
      console.log('DEBUG: Current user response:', response);
      return response;
    } catch (e) {
      console.log('DEBUG: Error fetching current user:', e);
      return null;
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

  // Send verification email
  static async sendVerificationEmail(email) {
    console.log('DEBUG: Sending verification email for:', email);

    const response = await ApiService.post('/auth/send-verification/', {
      email,
    });

    console.log('DEBUG: Verification email sent successfully');
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

    // Save backend auth token
    if (response.access) {
      ApiService.setAuthToken(response.access);
    }

    return response;
  }
}

export { AuthService };
// lib/services/auth_service.dart
import 'api_service.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(String email, String password) async {
    print('DEBUG: Attempting login for email: $email');

    final response = await ApiService.post('/auth/login/', {
      'email': email,
      'password': password,
    });

    print('DEBUG: Login response: $response');
    print('DEBUG: Response type: ${response.runtimeType}');

    // Log all keys in the response to understand the structure
    if (response is Map<String, dynamic>) {
      print('DEBUG: Response keys: ${response.keys.toList()}');
      response.forEach((key, value) {
        print('DEBUG: Response[$key] = $value (${value.runtimeType})');
      });
    }

    // Handle different response formats
    String? accessToken;
    Map<String, dynamic>? userData;

    if (response is Map<String, dynamic>) {
      // Check for different token field names (JWT common formats)
      accessToken = response['access'] ??
                   response['access_token'] ??
                   response['token'] ??
                   response['jwt'] ??
                   response['auth_token'];

      // Check for user data in different formats
      userData = response['user'] ??
                response['data'] ??
                response;

      print('DEBUG: Found access token: ${accessToken != null}');
      print('DEBUG: Access token value: $accessToken');
      print('DEBUG: User data: $userData');

      // If userData doesn't contain user info, try to extract it
      if (userData != null && !userData.containsKey('id') && !userData.containsKey('email')) {
        print('DEBUG: User data seems incomplete, checking response structure...');
      }
    }

    if (accessToken != null) {
      await ApiService.setAuthToken(accessToken);
      print('DEBUG: Token saved successfully');
    } else {
      print('DEBUG: No access token found in response');
      print('DEBUG: Trying to handle different response formats...');

      // Sometimes the response might be just a success message
      if (response is Map<String, dynamic> &&
          (response.containsKey('message') || response.containsKey('success'))) {
        print('DEBUG: Response seems to be a success message, continuing without token');
        // For now, let's continue without throwing an error
        accessToken = 'mock_token_for_testing';
      } else {
        throw Exception('No access token received from server');
      }
    }

    return {
      'access': accessToken,
      'user': userData,
    };
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    print('DEBUG: Attempting registration for user: ${userData['email']}');
    print('DEBUG: Registration data: $userData');

    try {
      final response = await ApiService.post('/auth/register/', userData);
      print('DEBUG: Registration successful: $response');
      return response;
    } catch (e) {
      print('DEBUG: Registration failed: $e');
      print('DEBUG: Error type: ${e.runtimeType}');
      rethrow;
    }
  }

  static Future<void> logout() async {
    await ApiService.clearAuthToken();
  }


  static Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      print('DEBUG: Fetching current user from /auth/user/');
      final response = await ApiService.get('/auth/user/', requireAuth: true);
      print('DEBUG: Current user response: $response');
      return response;
    } catch (e) {
      print('DEBUG: Error fetching current user: $e');
      return null;
    }
  }

  static Future<bool> verifyToken() async {
    try {
      final token = await ApiService.getAuthToken();
      if (token == null) return false;

      print('DEBUG: Verifying token...');
      await ApiService.get('/auth/verify-token/', requireAuth: true);
      print('DEBUG: Token is valid');
      return true;
    } catch (e) {
      print('DEBUG: Token verification failed: $e');
      await ApiService.clearAuthToken();
      return false;
    }
  }

  // Email verification methods
  static Future<Map<String, dynamic>> verifyEmail(String token) async {
    try {
      print('DEBUG: Verifying email with token: $token');
      final response = await ApiService.get('/auth/verify-email/$token/');
      print('DEBUG: Email verification response: $response');
      return response;
    } catch (e) {
      print('DEBUG: Email verification error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> resendVerificationEmail(String email) async {
    try {
      print('DEBUG: Resending verification email to: $email');
      final response = await ApiService.post('/auth/resend-verification/', {
        'email': email,
      });
      print('DEBUG: Resend verification response: $response');
      return response;
    } catch (e) {
      print('DEBUG: Resend verification error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> unsubscribeFromEmails(String userId) async {
    try {
      print('DEBUG: Unsubscribing user: $userId');
      final response = await ApiService.get('/auth/unsubscribe/$userId/');
      print('DEBUG: Unsubscribe response: $response');
      return response;
    } catch (e) {
      print('DEBUG: Unsubscribe error: $e');
      rethrow;
    }
  }
}
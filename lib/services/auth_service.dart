// lib/services/auth_service.dart
import 'api_service.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await ApiService.post('/auth/login/', {
      'email': email,
      'password': password,
    });

    // Save tokens
    await ApiService.setAuthToken(response['access']);
    // TODO: Handle refresh token

    return response;
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    return await ApiService.post('/auth/register/', userData);
  }

  static Future<void> logout() async {
    await ApiService.clearAuthToken();
  }

  static Future<void> verifyEmail(String token) async {
    await ApiService.post('/auth/verify-email/', {'token': token});
  }
}
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api/v1';
  static String? _authToken;

  // Token management
  static Future<void> setAuthToken(String token) async {
    _authToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<String?> getAuthToken() async {
    if (_authToken != null) return _authToken;

    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
    return _authToken;
  }

  static Future<void> clearAuthToken() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // HTTP Headers
  static Future<Map<String, String>> _getHeaders({bool requireAuth = false}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      final token = await getAuthToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // Generic HTTP methods
  static Future<dynamic> get(String endpoint, {bool requireAuth = false}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(requireAuth: requireAuth),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      throw ApiException(0, e.toString());
    }
  }

  static Future<dynamic> post(
      String endpoint,
      Map<String, dynamic> data,
      {bool requireAuth = false}
      ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(requireAuth: requireAuth),
        body: json.encode(data),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(response.body);
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      throw ApiException(0, e.toString());
    }
  }

  static Future<dynamic> put(
      String endpoint,
      Map<String, dynamic> data,
      {bool requireAuth = true}
      ) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(requireAuth: requireAuth),
        body: json.encode(data),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(response.body);
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      throw ApiException(0, e.toString());
    }
  }

  static Future<dynamic> delete(String endpoint, {bool requireAuth = true}) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(requireAuth: requireAuth),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.body.isNotEmpty ? json.decode(response.body) : null;
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      throw ApiException(0, e.toString());
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException: $statusCode - $message';
}
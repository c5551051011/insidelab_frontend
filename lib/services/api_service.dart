// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/environment.dart';

class ApiService {
  // Use environment-based URL configuration
  static String get baseUrl => Environment.apiUrl;
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
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    };

    if (requireAuth) {
      final token = await getAuthToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // Clean request data to avoid JSON parsing issues
  static Map<String, dynamic> _cleanRequestData(Map<String, dynamic> data) {
    final cleanData = <String, dynamic>{};

    for (final entry in data.entries) {
      final key = entry.key;
      final value = entry.value;

      if (value is String) {
        // Remove or escape problematic characters
        final cleanValue = value
            .replaceAll('\n', '\\n')
            .replaceAll('\r', '\\r')
            .replaceAll('\t', '\\t')
            .replaceAll('\b', '\\b')
            .replaceAll('\f', '\\f')
            .replaceAll('"', '\\"')
            .trim();
        cleanData[key] = cleanValue;
      } else {
        cleanData[key] = value;
      }
    }

    return cleanData;
  }

  // Generic HTTP methods
  static Future<dynamic> get(String endpoint, {bool requireAuth = false}) async {
    try {
      final fullUrl = '$baseUrl$endpoint';
      print('ApiService GET: $fullUrl');

      final response = await http.get(
        Uri.parse(fullUrl),
        headers: await _getHeaders(requireAuth: requireAuth),
      );

      print('ApiService GET Response: ${response.statusCode}');
      if (response.statusCode != 200) {
        print('ApiService GET Response Body: ${response.body}');
      }

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else if (response.statusCode == 404) {
        throw UnsupportedEndpointException(endpoint, 'Endpoint not found - ${response.body}');
      } else if (response.statusCode == 405) {
        throw UnsupportedEndpointException(endpoint, 'Method not allowed - ${response.body}');
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      print('ApiService GET Exception: $e');
      if (e is UnsupportedEndpointException || e is ApiException) {
        rethrow;
      }
      throw ApiException(0, e.toString());
    }
  }

  static Future<dynamic> post(
      String endpoint,
      Map<String, dynamic> data,
      {bool requireAuth = false}
      ) async {
    try {
      print('Making POST request to: $baseUrl$endpoint');

      // Clean and validate data before encoding
      final cleanData = _cleanRequestData(data);
      final jsonString = json.encode(cleanData);

      print('Request data: $jsonString');
      print('Request data length: ${jsonString.length}');

      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: await _getHeaders(requireAuth: requireAuth),
        body: jsonString,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Request timeout - server took too long to respond');
        },
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(response.body);
      } else if (response.statusCode == 404) {
        throw UnsupportedEndpointException(endpoint, 'Endpoint not found');
      } else if (response.statusCode == 405) {
        throw UnsupportedEndpointException(endpoint, 'Method not allowed');
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      print('API Error: $e');
      print('API Error type: ${e.runtimeType}');

      // Handle different types of network errors
      if (e.toString().contains('Failed to fetch') ||
          e.toString().contains('XMLHttpRequest') ||
          e.toString().contains('CORS')) {
        print('DEBUG: Network/CORS error detected');
        throw ApiException(0, 'Cannot connect to server. Please check if the backend is running and CORS is configured properly.');
      }

      // Handle timeout errors
      if (e.toString().contains('timeout') || e.toString().contains('TimeoutException')) {
        print('DEBUG: Request timeout detected');
        throw ApiException(0, 'Request timeout. The server is taking too long to respond. Please try again.');
      }

      // Handle JSON parsing errors
      if (e.toString().contains('JSON') || e.toString().contains('parse')) {
        print('DEBUG: JSON parsing error detected');
        throw ApiException(0, 'Server response format error. Please try again or contact support.');
      }

      if (e is UnsupportedEndpointException || e is ApiException) {
        rethrow;
      }
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
      } else if (response.statusCode == 404) {
        throw UnsupportedEndpointException(endpoint, 'Endpoint not found');
      } else if (response.statusCode == 405) {
        throw UnsupportedEndpointException(endpoint, 'Method not allowed');
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      if (e is UnsupportedEndpointException || e is ApiException) {
        rethrow;
      }
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
      } else if (response.statusCode == 404) {
        throw UnsupportedEndpointException(endpoint, 'Endpoint not found');
      } else if (response.statusCode == 405) {
        throw UnsupportedEndpointException(endpoint, 'Method not allowed');
      } else {
        throw ApiException(response.statusCode, response.body);
      }
    } catch (e) {
      if (e is UnsupportedEndpointException || e is ApiException) {
        rethrow;
      }
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

class UnsupportedEndpointException implements Exception {
  final String endpoint;
  final String message;

  UnsupportedEndpointException(this.endpoint, this.message);

  @override
  String toString() => 'UnsupportedEndpointException: $endpoint - $message';
}
// lib/config/environment.dart
import 'package:flutter/foundation.dart';

class Environment {
  // Development API URL (local backend)
  static const String _devApiUrl = 'http://127.0.0.1:8000/api/v1';

  // Production API URL (Railway deployment)
  static const String _prodApiUrl = 'https://insidelab.up.railway.app/api/v1';

  // Demo/Mock API URL for MVP without backend
  static const String _demoApiUrl = 'https://demo-api.insidelab.app/api/v1';

  // Get the appropriate API URL based on build mode
  static String get apiUrl {
    if (kDebugMode) {
      // Development mode - try local first, fallback to Railway
      // You can change this to _devApiUrl if you want to use local backend in development
      return _prodApiUrl; // Use Railway backend
    } else if (kReleaseMode) {
      // Production mode - use Railway backend
      return _prodApiUrl;
    } else {
      // Profile mode - use Railway backend
      return _prodApiUrl;
    }
  }

  // Alternative API URLs for fallback
  static String get localApiUrl => _devApiUrl;
  static String get railwayApiUrl => _prodApiUrl;

  // For MVP demo without backend, you can force demo mode
  static String get demoApiUrl => _demoApiUrl;

  // Check if we're running in demo mode
  static bool get isDemoMode => apiUrl == _demoApiUrl;

  // App configuration
  static const String appName = 'InsideLab';
  static const String appVersion = '1.0.0';

  // Features flags for MVP
  static const bool enableGoogleAuth = true; // Enable with live backend
  static const bool enablePushNotifications = false;
  static const bool enableAnalytics = false;
}
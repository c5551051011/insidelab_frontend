// lib/config/environment.dart
import 'package:flutter/foundation.dart';

class Environment {
  // Development API URL (local backend)
  static const String _devApiUrl = 'http://127.0.0.1:8000/api/v1';

  // Production API URL (replace with your actual backend URL when available)
  static const String _prodApiUrl = 'https://your-backend-domain.com/api/v1';

  // Demo/Mock API URL for MVP without backend
  static const String _demoApiUrl = 'https://demo-api.insidelab.app/api/v1';

  // Get the appropriate API URL based on build mode
  static String get apiUrl {
    if (kDebugMode) {
      // Development mode - use local backend
      return _devApiUrl;
    } else if (kReleaseMode) {
      // Production mode - check if backend is available, otherwise use demo
      return _prodApiUrl; // Change to _demoApiUrl for MVP demo
    } else {
      // Profile mode
      return _devApiUrl;
    }
  }

  // For MVP demo without backend, you can force demo mode
  static String get demoApiUrl => _demoApiUrl;

  // Check if we're running in demo mode
  static bool get isDemoMode => apiUrl == _demoApiUrl;

  // App configuration
  static const String appName = 'InsideLab';
  static const String appVersion = '1.0.0';

  // Features flags for MVP
  static const bool enableGoogleAuth = false; // Disable until properly configured
  static const bool enablePushNotifications = false;
  static const bool enableAnalytics = false;
}
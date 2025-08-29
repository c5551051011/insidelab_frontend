// utils/validators.dart
class Validators {
  // Email validation
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email);
  }

  // Edu email validation
  static bool isEduEmail(String email) {
    return isValidEmail(email) && email.toLowerCase().endsWith('.edu');
  }

  // Password validation
  static String? validatePassword(String? password) {
    if (password == null || password.isEmpty) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!password.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!password.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!password.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    return null;
  }

  // Review text validation
  static String? validateReviewText(String? text) {
    if (text == null || text.isEmpty) {
      return 'Review text is required';
    }
    if (text.length < 50) {
      return 'Review must be at least 50 characters long';
    }
    if (text.length > 2000) {
      return 'Review must be less than 2000 characters';
    }
    return null;
  }

  // Rating validation
  static bool isValidRating(double rating) {
    return rating >= 0 && rating <= 5;
  }

  // URL validation
  static bool isValidUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https');
    } catch (e) {
      return false;
    }
  }
}

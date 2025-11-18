import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthService {
  // TODO: Replace with your actual Google Client ID
  static const String _webClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  static GoogleSignIn? _googleSignIn;

  static GoogleSignIn _getGoogleSignIn() {
    if (_googleSignIn != null) return _googleSignIn!;

    // Check if Client ID is configured
    if (_webClientId.contains('YOUR_GOOGLE_CLIENT_ID')) {
      throw Exception(
        'Google Client ID not configured. Please replace YOUR_GOOGLE_CLIENT_ID in google_auth_service.dart and web/index.html with your actual Google Client ID from Google Cloud Console.'
      );
    }

    _googleSignIn = GoogleSignIn(
      scopes: [
        'email',
        'profile',
      ],
      // Configure client ID for different platforms
      clientId: _webClientId,
    );

    return _googleSignIn!;
  }

  static GoogleSignInAccount? _currentUser;

  /// Sign in with Google using modern approach
  static Future<Map<String, dynamic>?> signInWithGoogle() async {
    try {
      final googleSignIn = _getGoogleSignIn();

      // For web platform, try signInSilently first (recommended approach)
      GoogleSignInAccount? googleUser = await googleSignIn.signInSilently();

      // If silent sign-in fails, use the standard sign-in flow
      if (googleUser == null) {
        googleUser = await googleSignIn.signIn();
      }

      if (googleUser == null) {
        // User canceled the sign-in
        return null;
      }

      // Get authentication details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Store current user
      _currentUser = googleUser;

      // Check if user email is from an educational institution (.edu)
      final isEduEmail = _isEducationalEmail(googleUser.email);

      return {
        'uid': googleUser.id,
        'email': googleUser.email,
        'displayName': googleUser.displayName,
        'photoURL': googleUser.photoUrl,
        'isEduEmail': isEduEmail,
        'isNewUser': true, // Since we don't have backend to check this
        'idToken': googleAuth.idToken,
        'accessToken': googleAuth.accessToken,
      };
    } catch (error) {
      print('Google Sign-In Error: $error');
      rethrow;
    }
  }

  /// Sign out from Google
  static Future<void> signOut() async {
    try {
      final googleSignIn = _getGoogleSignIn();
      await googleSignIn.signOut();
      _currentUser = null;
    } catch (error) {
      print('Sign-Out Error: $error');
      rethrow;
    }
  }

  /// Check if the user is currently signed in
  static Future<bool> isSignedIn() async {
    try {
      final googleSignIn = _getGoogleSignIn();
      final isSignedIn = await googleSignIn.isSignedIn();
      if (isSignedIn) {
        _currentUser = googleSignIn.currentUser;
      }
      return isSignedIn;
    } catch (error) {
      print('Check Sign-In Status Error: $error');
      return false;
    }
  }

  /// Get current user information
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      if (_currentUser == null) {
        final googleSignIn = _getGoogleSignIn();
        _currentUser = googleSignIn.currentUser;
      }
      
      if (_currentUser == null) {
        return null;
      }

      final isEduEmail = _isEducationalEmail(_currentUser!.email);
      
      return {
        'uid': _currentUser!.id,
        'email': _currentUser!.email,
        'displayName': _currentUser!.displayName,
        'photoURL': _currentUser!.photoUrl,
        'isEduEmail': isEduEmail,
        'emailVerified': true, // Google accounts are always verified
      };
    } catch (error) {
      print('Get Current User Error: $error');
      return null;
    }
  }

  /// Check if email is from educational institution
  static bool _isEducationalEmail(String email) {
    final educationalDomains = [
      '.edu',
      '.ac.uk',
      '.edu.au',
      '.edu.ca',
      '.ac.kr',
      '.ac.jp',
      '.univ.fr',
      '.uni.de',
    ];
    
    return educationalDomains.any((domain) => 
        email.toLowerCase().endsWith(domain));
  }

  /// Disconnect Google account (revoke access)
  static Future<void> disconnect() async {
    try {
      final googleSignIn = _getGoogleSignIn();
      await googleSignIn.disconnect();
      _currentUser = null;
    } catch (error) {
      print('Disconnect Error: $error');
      rethrow;
    }
  }

  /// Handle sign-in errors with user-friendly messages
  static String getErrorMessage(dynamic error) {
    String errorMessage = error.toString().toLowerCase();

    if (errorMessage.contains('popup_closed') || errorMessage.contains('popup-closed')) {
      return 'Sign-in popup was closed. Please try again and allow popups for this site.';
    } else if (errorMessage.contains('network')) {
      return 'Network error. Please check your internet connection.';
    } else if (errorMessage.contains('user-disabled')) {
      return 'This account has been disabled. Please contact support.';
    } else if (errorMessage.contains('user-not-found')) {
      return 'No account found with this email.';
    } else if (errorMessage.contains('account-exists-with-different-credential')) {
      return 'An account already exists with this email using a different sign-in method.';
    } else if (errorMessage.contains('invalid-credential')) {
      return 'Invalid credentials. Please try again.';
    } else if (errorMessage.contains('operation-not-allowed')) {
      return 'Google Sign-In is not enabled. Please contact support.';
    } else if (errorMessage.contains('popup-closed-by-user')) {
      return 'Sign-in was cancelled.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }
}
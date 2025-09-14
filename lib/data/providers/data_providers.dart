// data/providers/data_providers.dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '../repositories/lab_repository.dart';
import '../repositories/review_repository.dart';
import '../models/lab.dart';
import '../models/review.dart';
import '../models/user.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../services/google_auth_service.dart';

// Lab Provider
class LabProvider extends ChangeNotifier {
  final LabRepository _repository;

  List<Lab>? _featuredLabs;
  Lab? _selectedLab;
  List<Lab>? _searchResults;
  bool _isLoading = false;
  String? _error;

  LabProvider(this._repository);

  // Getters
  List<Lab>? get featuredLabs => _featuredLabs;
  Lab? get selectedLab => _selectedLab;
  List<Lab>? get searchResults => _searchResults;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load featured labs
  Future<void> loadFeaturedLabs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _featuredLabs = await _repository.getFeaturedLabs();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load lab details
  Future<void> loadLabDetails(String labId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedLab = await _repository.getLabById(labId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Search labs
  Future<void> searchLabs(String query, Map<String, dynamic>? filters) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _searchResults = await _repository.searchLabs(query, filters);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear search results
  void clearSearch() {
    _searchResults = null;
    notifyListeners();
  }
}

// Review Provider
class ReviewProvider extends ChangeNotifier {
  final ReviewRepository _repository;

  Map<String, List<Review>> _labReviews = {};
  bool _isLoading = false;
  String? _error;

  ReviewProvider(this._repository);

  // Getters
  List<Review>? getLabReviews(String labId) => _labReviews[labId];
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load reviews for a lab
  Future<void> loadLabReviews(String labId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _labReviews[labId] = await _repository.getReviewsByLab(labId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Submit a review
  Future<void> submitReview(Review review) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _repository.submitReview(review);
      // Reload reviews for the lab
      await loadLabReviews(review.labId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Mark review as helpful
  Future<void> markReviewHelpful(String reviewId, bool isHelpful) async {
    try {
      await _repository.updateHelpfulCount(reviewId, isHelpful);
      // Update local state
      _labReviews.forEach((labId, reviews) {
        final index = reviews.indexWhere((r) => r.id == reviewId);
        if (index != -1) {
          final review = reviews[index];
          reviews[index] = Review(
            id: review.id,
            labId: review.labId,
            userId: review.userId,
            position: review.position,
            duration: review.duration,
            reviewDate: review.reviewDate,
            rating: review.rating,
            categoryRatings: review.categoryRatings,
            reviewText: review.reviewText,
            pros: review.pros,
            cons: review.cons,
            helpfulCount: review.helpfulCount + (isHelpful ? 1 : -1),
            isVerified: review.isVerified,
          );
        }
      });
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}

// Auth Provider
class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Sign in
  Future<void> signIn(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await AuthService.login(email, password);

      // Create user from backend response
      _currentUser = User(
        id: response['user']['id'].toString(),
        email: response['user']['email'],
        name: response['user']['name'] ?? response['user']['username'] ?? email.split('@')[0],
        verificationStatus: response['user']['is_verified'] == true
            ? VerificationStatus.verified
            : VerificationStatus.unverified,
        isLabMember: response['user']['is_lab_member'] ?? false,
        university: response['user']['university'],
        department: response['user']['department'],
        labName: response['user']['lab_name'],
        position: response['user']['position'],
        joinedDate: DateTime.parse(response['user']['created_at'] ?? DateTime.now().toIso8601String()),
        reviewCount: response['user']['review_count'] ?? 0,
        helpfulVotes: response['user']['helpful_votes'] ?? 0,
      );
      _isAuthenticated = true;
    } catch (error) {
      if (error is ApiException && error.statusCode == 0) {
        // Network error or backend not running - provide helpful message
        _errorMessage = 'Cannot connect to server. Please make sure your backend is running at ${ApiService.baseUrl}';
      } else {
        _errorMessage = _getErrorMessage(error);
      }
      _isAuthenticated = false;
      _currentUser = null;
      rethrow; // Re-throw so the UI can handle it
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign up
  Future<void> signUp(Map<String, String?> userData) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await AuthService.register({
        'email': userData['email']!,
        'username': userData['username']!,
        'name': userData['name']!,
        'password': userData['password']!,
        'password_confirm': userData['password_confirm']!,
        'position': userData['position']!,
        'department': userData['department']!,
      });

      // Create user from backend response
      _currentUser = User(
        id: response['user']['id'].toString(),
        email: response['user']['email'],
        name: response['user']['name'] ?? response['user']['username'] ?? userData['email']!.split('@')[0],
        verificationStatus: response['user']['is_verified'] == true
            ? VerificationStatus.verified
            : VerificationStatus.unverified,
        isLabMember: response['user']['is_lab_member'] ?? false,
        university: response['user']['university'],
        department: response['user']['department'],
        labName: response['user']['lab_name'],
        position: response['user']['position'],
        joinedDate: DateTime.parse(response['user']['created_at'] ?? DateTime.now().toIso8601String()),
        reviewCount: response['user']['review_count'] ?? 0,
        helpfulVotes: response['user']['helpful_votes'] ?? 0,
      );
      _isAuthenticated = true;
    } catch (error) {
      print('Sign-up error: $error');
      if (error is ApiException) {
        if (error.statusCode == 0) {
          // Network error or connection issue
          _errorMessage = 'Cannot connect to server. Please make sure your backend is running at ${ApiService.baseUrl}';
        } else {
          // Backend returned an error response
          _errorMessage = _getErrorMessage(error);
        }
      } else {
        // Other types of errors
        _errorMessage = 'Sign-up failed: ${error.toString()}';
      }
      _isAuthenticated = false;
      _currentUser = null;
      rethrow; // Re-throw so the UI can handle it
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await GoogleAuthService.signInWithGoogle();

      if (result != null) {
        // Try to sync with backend or create/update user
        try {
          final response = await ApiService.post('/auth/google/', {
            'id_token': result['idToken'],
            'email': result['email'],
            'name': result['displayName'],
          });

          // Save backend auth token
          await ApiService.setAuthToken(response['access']);

          _currentUser = User(
            id: response['user']['id'].toString(),
            email: response['user']['email'],
            name: response['user']['name'] ?? response['user']['username'] ?? result['displayName'],
            verificationStatus: response['user']['is_verified'] == true
                ? VerificationStatus.verified
                : VerificationStatus.unverified,
            isLabMember: response['user']['is_lab_member'] ?? false,
            university: response['user']['university'],
            department: response['user']['department'],
            labName: response['user']['lab_name'],
            position: response['user']['position'],
            joinedDate: DateTime.parse(response['user']['created_at'] ?? DateTime.now().toIso8601String()),
            reviewCount: response['user']['review_count'] ?? 0,
            helpfulVotes: response['user']['helpful_votes'] ?? 0,
          );
        } catch (backendError) {
          // If backend fails, still create user from Google data
          _currentUser = User(
            id: result['uid'],
            email: result['email'] ?? '',
            name: result['displayName'] ?? result['email']?.split('@')[0] ?? 'User',
            verificationStatus: VerificationStatus.verified,
            joinedDate: DateTime.now(),
            reviewCount: 0,
            helpfulVotes: 0,
          );

          _errorMessage = 'Signed in with Google, but could not sync with backend. Some features may be limited.';
        }

        _isAuthenticated = true;
      }
    } catch (error) {
      _errorMessage = GoogleAuthService.getErrorMessage(error);
      _isAuthenticated = false;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Check current authentication status
  Future<void> checkAuthStatus() async {
    // Don't set loading state if we're already checking auth
    if (_isLoading) return;

    _isLoading = true;

    // Use scheduleMicrotask to avoid calling notifyListeners during build
    scheduleMicrotask(() => notifyListeners());

    try {
      // First check for stored auth token
      final token = await ApiService.getAuthToken();

      if (token != null) {
        // Try to get user data from backend
        try {
          final response = await ApiService.get('/auth/user/', requireAuth: true);

          _currentUser = User(
            id: response['id'].toString(),
            email: response['email'],
            name: response['name'] ?? response['username'] ?? response['email'].split('@')[0],
            verificationStatus: response['is_verified'] == true
                ? VerificationStatus.verified
                : VerificationStatus.unverified,
            isLabMember: response['is_lab_member'] ?? false,
            university: response['university'],
            department: response['department'],
            labName: response['lab_name'],
            position: response['position'],
            joinedDate: DateTime.parse(response['created_at'] ?? DateTime.now().toIso8601String()),
            reviewCount: response['review_count'] ?? 0,
            helpfulVotes: response['helpful_votes'] ?? 0,
          );
          _isAuthenticated = true;
          return;
        } catch (apiError) {
          // Token might be expired, clear it
          await ApiService.clearAuthToken();
        }
      }

      // Fallback to Google auth check
      final userData = await GoogleAuthService.getCurrentUser();

      if (userData != null) {
        _currentUser = User(
          id: userData['uid'],
          email: userData['email'] ?? '',
          name: userData['displayName'] ?? userData['email']?.split('@')[0] ?? 'User',
          verificationStatus: VerificationStatus.verified,
          joinedDate: DateTime.now(), // In real app, get from backend
          reviewCount: 0, // In real app, get from backend
          helpfulVotes: 0, // In real app, get from backend
        );
        _isAuthenticated = true;
      } else {
        _currentUser = null;
        _isAuthenticated = false;
      }
    } catch (error) {
      _currentUser = null;
      _isAuthenticated = false;
      _errorMessage = _getErrorMessage(error);
    } finally {
      _isLoading = false;
      // Use scheduleMicrotask to avoid calling notifyListeners during build
      scheduleMicrotask(() => notifyListeners());
    }
  }

  // Sign out
  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Sign out from both services
      await AuthService.logout(); // This clears the API token
      await GoogleAuthService.signOut(); // This signs out from Google
    } catch (error) {
      _errorMessage = _getErrorMessage(error);
    } finally {
      _currentUser = null;
      _isAuthenticated = false;
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update user profile
  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    if (!_isAuthenticated || _currentUser == null) {
      throw Exception('User not authenticated');
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.put('/auth/profile/', profileData, requireAuth: true);

      // Update local user data
      _currentUser = User(
        id: _currentUser!.id,
        email: response['email'] ?? _currentUser!.email,
        name: response['name'] ?? response['username'] ?? _currentUser!.name,
        verificationStatus: response['is_verified'] == true
            ? VerificationStatus.verified
            : VerificationStatus.unverified,
        isLabMember: response['is_lab_member'] ?? _currentUser!.isLabMember,
        university: response['university'] ?? _currentUser!.university,
        department: response['department'] ?? _currentUser!.department,
        labName: response['lab_name'] ?? _currentUser!.labName,
        position: response['position'] ?? _currentUser!.position,
        joinedDate: _currentUser!.joinedDate, // Keep original join date
        reviewCount: response['review_count'] ?? _currentUser!.reviewCount,
        helpfulVotes: response['helpful_votes'] ?? _currentUser!.helpfulVotes,
      );
    } catch (error) {
      _errorMessage = _getErrorMessage(error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Helper method to get user-friendly error messages
  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      // Try to parse JSON error message from backend
      try {
        final errorData = json.decode(error.message);
        if (errorData is Map<String, dynamic>) {
          // Extract error message from different possible formats
          if (errorData['error'] != null) {
            return errorData['error'].toString();
          }
          if (errorData['detail'] != null) {
            return errorData['detail'].toString();
          }
          if (errorData['message'] != null) {
            return errorData['message'].toString();
          }
          // Handle field-specific errors
          if (errorData['email'] != null) {
            return 'Email: ${errorData['email'][0]}';
          }
          if (errorData['username'] != null) {
            return 'Username: ${errorData['username'][0]}';
          }
          if (errorData['password'] != null) {
            return 'Password: ${errorData['password'][0]}';
          }
        }
      } catch (parseError) {
        // If parsing fails, fall back to default messages
      }

      // Default messages based on status code
      switch (error.statusCode) {
        case 401:
          return 'Invalid email or password. Please try again.';
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 404:
          return 'Account not found. Please sign up first.';
        case 409:
          return 'This email or username is already registered.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return 'Request failed (${error.statusCode}). Please try again.';
      }
    }
    return error.toString();
  }
}
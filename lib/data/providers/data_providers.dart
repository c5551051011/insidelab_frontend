// data/providers/data_providers.dart
import 'package:flutter/material.dart';
import '../repositories/lab_repository.dart';
import '../repositories/review_repository.dart';
import '../models/lab.dart';
import '../models/review.dart';
import '../models/user.dart';
import '../../services/auth_service.dart';
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
    notifyListeners();

    try {
      // TODO: Implement actual authentication
      await Future.delayed(const Duration(seconds: 1));

      _currentUser = User(
        id: 'user123',
        email: email,
        name: 'Test User',
        verificationStatus: VerificationStatus.verified,
        isLabMember: true, // Enable lab member status
        university: 'Test University',
        department: 'Computer Science',
        labName: 'AI Research Lab',
        position: 'PhD Student',
        joinedDate: DateTime.now(),
        reviewCount: 5,
        helpfulVotes: 23,
      );
      _isAuthenticated = true;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign up
  Future<void> signUp(Map<String, String?> userData) async {
    _isLoading = true;
    notifyListeners();

    try {
      // TODO: Implement actual registration using AuthService
      await Future.delayed(const Duration(seconds: 1));

      _currentUser = User(
        id: 'user${DateTime.now().millisecondsSinceEpoch}',
        email: userData['email']!,
        name: userData['username']!,
        verificationStatus: VerificationStatus.unverified, // New users need verification
        joinedDate: DateTime.now(),
        reviewCount: 0,
        helpfulVotes: 0,
      );
      _isAuthenticated = true;
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
        _currentUser = User(
          id: result['uid'],
          email: result['email'] ?? '',
          name: result['displayName'] ?? result['email']?.split('@')[0] ?? 'User',
          verificationStatus: (result['isEduEmail'] ?? false) 
            ? VerificationStatus.verified 
            : VerificationStatus.unverified,
          joinedDate: DateTime.now(),
          reviewCount: 0,
          helpfulVotes: 0,
        );
        _isAuthenticated = true;
        
        // Show verification notice if not edu email
        if (!(result['isEduEmail'] ?? false)) {
          _errorMessage = 'Please use your university email (.edu) for full verification';
        }
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
    _isLoading = true;
    notifyListeners();

    try {
      final userData = await GoogleAuthService.getCurrentUser();
      
      if (userData != null) {
        _currentUser = User(
          id: userData['uid'],
          email: userData['email'] ?? '',
          name: userData['displayName'] ?? userData['email']?.split('@')[0] ?? 'User',
          verificationStatus: (userData['isEduEmail'] ?? false)
            ? VerificationStatus.verified 
            : VerificationStatus.unverified,
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
      _errorMessage = GoogleAuthService.getErrorMessage(error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Sign out
  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();

    try {
      await GoogleAuthService.signOut();
    } catch (error) {
      _errorMessage = GoogleAuthService.getErrorMessage(error);
    } finally {
      _currentUser = null;
      _isAuthenticated = false;
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Verify edu email
  Future<bool> verifyEduEmail(String email) async {
    // Check if email ends with .edu
    return email.toLowerCase().endsWith('.edu');
  }
}
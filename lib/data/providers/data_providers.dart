// data/providers/data_providers.dart
import 'package:flutter/material.dart';
import '../repositories/lab_repository.dart';
import '../repositories/review_repository.dart';
import '../models/lab.dart';
import '../models/review.dart';
import '../models/user.dart';
import '../../services/auth_service.dart';

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

  // Getters
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

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
        isVerified: true,
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
        isVerified: false, // New users need email verification
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

  // Sign out
  Future<void> signOut() async {
    _currentUser = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  // Verify edu email
  Future<bool> verifyEduEmail(String email) async {
    // Check if email ends with .edu
    return email.toLowerCase().endsWith('.edu');
  }
}
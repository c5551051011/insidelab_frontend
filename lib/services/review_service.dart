// lib/services/review_service.dart
import '../data/models/review.dart';
import 'api_service.dart';

class ReviewService {
  // Cache for rating categories to avoid repeated API calls
  static List<String>? _cachedRatingCategories;

  // Get rating categories from backend
  static Future<List<String>> getRatingCategories() async {
    if (_cachedRatingCategories != null) {
      print('DEBUG: Using cached categories: $_cachedRatingCategories');
      return _cachedRatingCategories!;
    }

    print('DEBUG: Fetching categories from /reviews/categories/');
    final response = await ApiService.get('/reviews/categories/');
    print('DEBUG: Categories response: $response');
    print('DEBUG: Response type: ${response.runtimeType}');

    if (response is List) {
      _cachedRatingCategories = List<String>.from(response);
      print('DEBUG: Parsed as List: $_cachedRatingCategories');
    } else if (response is Map && response.containsKey('categories')) {
      _cachedRatingCategories = List<String>.from(response['categories']);
      print('DEBUG: Parsed from categories key: $_cachedRatingCategories');
    } else if (response is Map && response.containsKey('results')) {
      _cachedRatingCategories = List<String>.from(response['results']);
      print('DEBUG: Parsed from results key: $_cachedRatingCategories');
    } else {
      print('DEBUG: Unexpected response format: $response');
    }

    print('DEBUG: Final cached categories: $_cachedRatingCategories');
    return _cachedRatingCategories!;
  }

  // Clear cached categories (useful if backend updates them)
  static void clearCachedCategories() {
    _cachedRatingCategories = null;
  }

  // Force refresh categories from backend
  static Future<List<String>> refreshRatingCategories() async {
    _cachedRatingCategories = null;
    return await getRatingCategories();
  }

  // Get reviews for a specific lab
  static Future<List<Review>> getLabReviews(String labId, {int page = 1, int limit = 20}) async {
    try {
      final response = await ApiService.get('/reviews/?lab=$labId&page=$page&limit=$limit');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Review.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Review.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching lab reviews: $e');
      return [];
    }
  }

  // Get all reviews with optional filters
  static Future<List<Review>> getReviews({
    int page = 1,
    int limit = 20,
    String? universityId,
    String? department,
    String? position,
    double? minRating,
  }) async {
    try {
      String queryParams = 'page=$page&limit=$limit';

      if (universityId != null) queryParams += '&university_id=$universityId';
      if (department != null) queryParams += '&department=$department';
      if (position != null) queryParams += '&position=$position';
      if (minRating != null) queryParams += '&min_rating=$minRating';

      final response = await ApiService.get('/reviews/?$queryParams');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Review.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Review.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching reviews: $e');
      return [];
    }
  }

  // Submit a new review
  static Future<Review> submitReview(Map<String, dynamic> reviewData) async {
    try {
      final response = await ApiService.post(
        '/reviews/',
        reviewData,
        requireAuth: true,
      );
      return Review.fromJson(response);
    } catch (e) {
      print('Error submitting review: $e');
      rethrow;
    }
  }

  // Update an existing review
  static Future<Review> updateReview(String reviewId, Map<String, dynamic> reviewData) async {
    try {
      final response = await ApiService.put('/reviews/$reviewId/', reviewData, requireAuth: true);
      return Review.fromJson(response);
    } catch (e) {
      print('Error updating review: $e');
      rethrow;
    }
  }

  // Delete a review
  static Future<bool> deleteReview(String reviewId) async {
    try {
      await ApiService.delete('/reviews/$reviewId/', requireAuth: true);
      return true;
    } catch (e) {
      print('Error deleting review: $e');
      return false;
    }
  }

  // Mark review as helpful
  static Future<void> markHelpful(String reviewId, bool isHelpful) async {
    try {
      await ApiService.post(
        '/reviews/$reviewId/helpful/',
        {'is_helpful': isHelpful},
        requireAuth: true,
      );
    } on UnsupportedEndpointException catch (e) {
      print('Review helpful marking not supported by backend: $e');
      // Silently ignore if not supported
    } catch (e) {
      print('Error marking review as helpful: $e');
      rethrow;
    }
  }

  // Get current user's reviews
  static Future<List<Review>> getMyReviews() async {
    try {
      final response = await ApiService.get('/reviews/my_reviews/', requireAuth: true);
      return (response as List).map((json) => Review.fromJson(json)).toList();
    } on UnsupportedEndpointException catch (e) {
      print('User reviews not supported by backend: $e');
      return [];
    } catch (e) {
      print('Error fetching user reviews: $e');
      return [];
    }
  }

  // Report a review
  static Future<bool> reportReview(String reviewId, String reason) async {
    try {
      await ApiService.post('/reviews/$reviewId/report/', {
        'reason': reason,
      }, requireAuth: true);
      return true;
    } on UnsupportedEndpointException catch (e) {
      print('Review reporting not supported by backend: $e');
      return false;
    } catch (e) {
      print('Error reporting review: $e');
      return false;
    }
  }
}
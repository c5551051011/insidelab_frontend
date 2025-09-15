// lib/services/review_service.dart
import '../data/models/review.dart';
import 'api_service.dart';

class ReviewService {
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
    } catch (e) {
      print('Error reporting review: $e');
      return false;
    }
  }
}
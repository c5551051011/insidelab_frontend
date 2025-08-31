// lib/services/review_service.dart
import '../data/models/review.dart';
import 'api_service.dart';

class ReviewService {
  static Future<List<Review>> getLabReviews(String labId) async {
    final response = await ApiService.get('/reviews/?lab=$labId');

    if (response is Map && response.containsKey('results')) {
      return (response['results'] as List)
          .map((json) => Review.fromJson(json))
          .toList();
    } else {
      return (response as List).map((json) => Review.fromJson(json)).toList();
    }
  }

  static Future<Review> submitReview(Map<String, dynamic> reviewData) async {
    final response = await ApiService.post(
      '/reviews/',
      reviewData,
      requireAuth: true,
    );
    return Review.fromJson(response);
  }

  static Future<void> markHelpful(String reviewId, bool isHelpful) async {
    await ApiService.post(
      '/reviews/$reviewId/helpful/',
      {'is_helpful': isHelpful},
      requireAuth: true,
    );
  }

  static Future<List<Review>> getMyReviews() async {
    final response = await ApiService.get('/reviews/my_reviews/', requireAuth: true);
    return (response as List).map((json) => Review.fromJson(json)).toList();
  }
}
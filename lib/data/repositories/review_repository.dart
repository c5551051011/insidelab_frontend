

// data/repositories/review_repository.dart
import '../models/review.dart';
import '../../services/review_service.dart';

abstract class ReviewRepository {
  Future<List<Review>> getReviewsByLab(String labId);
  Future<Review?> getReviewById(String id);
  Future<void> submitReview(Review review);
  Future<void> updateHelpfulCount(String reviewId, bool isHelpful);
  Future<void> reportReview(String reviewId, String reason);
  Future<List<Review>> getUserReviews(String userId);
}

class ReviewRepositoryImpl implements ReviewRepository {
  @override
  Future<List<Review>> getReviewsByLab(String labId) async {
    try {
      return await ReviewService.getLabReviews(labId);
    } catch (e) {
      print('Error fetching reviews: $e');
      return [];
    }
  }

  @override
  Future<Review?> getReviewById(String id) async {
    // Not implemented in API yet
    return null;
  }

  @override
  Future<void> submitReview(Review review) async {
    try {
      await ReviewService.submitReview(review.toJson());
    } catch (e) {
      print('Error submitting review: $e');
      throw e;
    }
  }

  @override
  Future<void> updateHelpfulCount(String reviewId, bool isHelpful) async {
    try {
      await ReviewService.markHelpful(reviewId, isHelpful);
    } catch (e) {
      print('Error updating helpful count: $e');
    }
  }

  @override
  Future<void> reportReview(String reviewId, String reason) async {
    // TODO: Implement when API endpoint is available
  }

  @override
  Future<List<Review>> getUserReviews(String userId) async {
    try {
      return await ReviewService.getMyReviews();
    } catch (e) {
      print('Error fetching user reviews: $e');
      return [];
    }
  }
}
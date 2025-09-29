// services/review_helpful_service.dart
import 'api_service.dart';

class ReviewHelpfulVote {
  final int helpfulCount;
  final bool? userVote;

  ReviewHelpfulVote({
    required this.helpfulCount,
    this.userVote,
  });

  factory ReviewHelpfulVote.fromJson(Map<String, dynamic> json) {
    return ReviewHelpfulVote(
      helpfulCount: json['helpful_count'] ?? 0,
      userVote: json['user_vote'],
    );
  }
}

class ReviewHelpfulService {
  /// Vote on a review's helpfulness
  /// [reviewId] - ID of the review to vote on
  /// [isHelpful] - true for helpful, false for not helpful
  /// Returns updated helpful count and user's vote status
  static Future<ReviewHelpfulVote?> voteOnReview(
    String reviewId,
    bool isHelpful,
  ) async {
    try {
      final response = await ApiService.post(
        '/reviews/$reviewId/helpful/',
        {
          'is_helpful': isHelpful,
        },
        requireAuth: true,
      );

      return ReviewHelpfulVote.fromJson(response);
    } catch (e) {
      print('Error voting on review: $e');
      return null;
    }
  }

  /// Get current vote status for a review (if needed separately)
  static Future<ReviewHelpfulVote?> getReviewVoteStatus(String reviewId) async {
    try {
      final response = await ApiService.get('/reviews/$reviewId/helpful/', requireAuth: true);
      return ReviewHelpfulVote.fromJson(response);
    } catch (e) {
      print('Error getting review vote status: $e');
      return null;
    }
  }

  /// Remove vote from a review (if supported by backend)
  static Future<bool> removeVote(String reviewId) async {
    try {
      await ApiService.delete('/reviews/$reviewId/helpful/', requireAuth: true);
      return true;
    } catch (e) {
      print('Error removing vote: $e');
      return false;
    }
  }

  /// Batch get vote statuses for multiple reviews
  static Future<Map<String, ReviewHelpfulVote>> getBatchVoteStatuses(
    List<String> reviewIds,
  ) async {
    try {
      final response = await ApiService.post(
        '/reviews/helpful/batch/',
        {
          'review_ids': reviewIds,
        },
        requireAuth: true,
      );

      final Map<String, ReviewHelpfulVote> result = {};
      if (response is Map) {
        response.forEach((key, value) {
          result[key] = ReviewHelpfulVote.fromJson(value);
        });
      }

      return result;
    } catch (e) {
      print('Error getting batch vote statuses: $e');
      return {};
    }
  }
}
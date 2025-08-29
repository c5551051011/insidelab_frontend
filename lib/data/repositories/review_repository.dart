
// data/repositories/review_repository.dart
import '../models/review.dart';

abstract class ReviewRepository {
  Future<List<Review>> getReviewsByLab(String labId);
  Future<Review?> getReviewById(String id);
  Future<void> submitReview(Review review);
  Future<void> updateHelpfulCount(String reviewId, bool isHelpful);
  Future<void> reportReview(String reviewId, String reason);
  Future<List<Review>> getUserReviews(String userId);
}

class ReviewRepositoryImpl implements ReviewRepository {
  // Mock data storage
  final List<Review> _reviews = [
    Review(
      id: '1',
      labId: '1',
      userId: 'user1',
      position: 'PhD Student',
      duration: '3 years',
      reviewDate: DateTime.now().subtract(const Duration(days: 7)),
      rating: 5.0,
      categoryRatings: {
        'Research Environment': 5.0,
        'Advisor Support': 4.5,
        'Work-Life Balance': 4.0,
        'Career Development': 5.0,
        'Funding Availability': 4.5,
      },
      reviewText: 'Excellent research environment with cutting-edge projects. '
          'The lab culture is very collaborative and supportive.',
      pros: [
        'Great mentorship and guidance',
        'Well-funded with latest equipment',
        'Collaborative environment',
        'Strong publication record',
      ],
      cons: [
        'High competition for positions',
        'Steep learning curve initially',
        'Can be stressful during deadlines',
      ],
      helpfulCount: 23,
      isVerified: true,
    ),
    Review(
      id: '2',
      labId: '1',
      userId: 'user2',
      position: 'MS Student',
      duration: '2 years',
      reviewDate: DateTime.now().subtract(const Duration(days: 30)),
      rating: 4.0,
      categoryRatings: {
        'Research Environment': 4.5,
        'Advisor Support': 4.0,
        'Work-Life Balance': 3.5,
        'Career Development': 4.5,
        'Funding Availability': 4.0,
      },
      reviewText: 'Good lab for ML research with access to great resources. '
          'Sometimes workload can be heavy during conference deadlines.',
      pros: [
        'Industry connections',
        'State-of-the-art resources',
        'Diverse research topics',
      ],
      cons: [
        'Heavy workload at times',
        'Limited 1-on-1 time with advisor',
      ],
      helpfulCount: 15,
      isVerified: true,
    ),
  ];

  @override
  Future<List<Review>> getReviewsByLab(String labId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _reviews.where((review) => review.labId == labId).toList();
  }

  @override
  Future<Review?> getReviewById(String id) async {
    try {
      return _reviews.firstWhere((review) => review.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> submitReview(Review review) async {
    await Future.delayed(const Duration(seconds: 1));
    _reviews.add(review);
  }

  @override
  Future<void> updateHelpfulCount(String reviewId, bool isHelpful) async {
    final index = _reviews.indexWhere((review) => review.id == reviewId);
    if (index != -1) {
      final review = _reviews[index];
      _reviews[index] = Review(
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
  }

  @override
  Future<void> reportReview(String reviewId, String reason) async {
    // TODO: Implement review reporting
    await Future.delayed(const Duration(milliseconds: 500));
  }

  @override
  Future<List<Review>> getUserReviews(String userId) async {
    return _reviews.where((review) => review.userId == userId).toList();
  }
}

// presentation/screens/lab_detail/widgets/reviews_list.dart
import 'package:flutter/material.dart';
import '../../../../data/models/review.dart';
import '../../../widgets/review_card.dart';

class ReviewsList extends StatelessWidget {
  final String labId;

  const ReviewsList({
    Key? key,
    required this.labId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual data from repository
    final reviews = _getMockReviews();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Reviews',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // TODO: Show all reviews
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ...reviews.map((review) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ReviewCard(review: review),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  List<Review> _getMockReviews() {
    return [
      Review(
        id: '1',
        labId: labId,
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
          'Great mentorship',
          'Well-funded',
          'Industry connections',
          'Publication opportunities',
        ],
        cons: [
          'High competition',
          'Steep learning curve',
        ],
        helpfulCount: 23,
        isVerified: true,
      ),
      Review(
        id: '2',
        labId: labId,
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
          'State-of-the-art equipment',
          'Diverse research topics',
        ],
        cons: [
          'Heavy workload',
          'Limited advisor time',
        ],
        helpfulCount: 15,
        isVerified: true,
      ),
    ];
  }
}
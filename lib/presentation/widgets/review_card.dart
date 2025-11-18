
// presentation/widgets/review_card.dart
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/review.dart';
import 'rating_stars.dart';
import 'review_helpful_widget.dart';

class ReviewCard extends StatelessWidget {
  final Review review;

  const ReviewCard({
    Key? key,
    required this.review,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 16),
          Text(
            review.reviewText,
            style: const TextStyle(fontSize: 16, height: 1.5),
          ),
          const SizedBox(height: 16),
          _buildProsCons(),
          const SizedBox(height: 16),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        // Left side - rating info (can shrink)
        Flexible(
          flex: 2,
          child: LayoutBuilder(
            builder: (context, constraints) {
              // If we have very little space, show only rating with stars
              if (constraints.maxWidth < 120) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(child: RatingStars(rating: review.rating)),
                    if (review.isVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.verified,
                        size: 14,
                        color: AppColors.primary,
                      ),
                    ],
                  ],
                );
              }

              // Normal layout with rating number
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(child: RatingStars(rating: review.rating)),
                  const SizedBox(width: 8),
                  Text(
                    review.rating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (review.isVerified) ...[
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.verified,
                      size: 16,
                      color: AppColors.primary,
                    ),
                  ],
                ],
              );
            },
          ),
        ),
        const SizedBox(width: 8),
        // Right side - metadata (can shrink)
        Expanded(
          flex: 3,
          child: Text(
            '${review.position} • ${review.duration} • ${_formatDate(review.reviewDate)}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildProsCons() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Pros:',
                style: TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              ...review.pros.map((pro) => Text('• $pro')),
            ],
          ),
        ),
        const SizedBox(width: 24),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Cons:',
                style: TextStyle(
                  color: AppColors.error,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              ...review.cons.map((con) => Text('• $con')),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Row(
      children: [
        Flexible(
          flex: 3,
          child: ReviewHelpfulWidget(
            review: review,
            onReviewUpdated: (updatedReview) {
              // The parent widget should handle the review update
              // This could be expanded to notify parent widgets if needed
            },
          ),
        ),
        const SizedBox(width: 8),
        TextButton.icon(
          onPressed: () {
            // TODO: Implement report
          },
          icon: const Icon(Icons.flag_outlined, size: 16),
          label: const Text('Report'),
          style: TextButton.styleFrom(
            foregroundColor: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.year}';
  }
}
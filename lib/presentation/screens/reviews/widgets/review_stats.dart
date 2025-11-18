// presentation/screens/reviews/widgets/review_stats.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class ReviewStats extends StatelessWidget {
  final int totalReviews;
  final double averageRating;
  final int verifiedReviews;
  final int recentReviews;

  const ReviewStats({
    Key? key,
    required this.totalReviews,
    required this.averageRating,
    required this.verifiedReviews,
    required this.recentReviews,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Row(
            children: [
              Expanded(child: _buildStatCard(
                icon: Icons.rate_review,
                value: totalReviews.toString(),
                label: 'Total Reviews',
                color: AppColors.primary,
              )),
              Expanded(child: _buildStatCard(
                icon: Icons.star,
                value: averageRating.toStringAsFixed(1),
                label: 'Average Rating',
                color: AppColors.warning,
              )),
              Expanded(child: _buildStatCard(
                icon: Icons.verified_user,
                value: verifiedReviews.toString(),
                label: 'Verified Reviews',
                color: AppColors.success,
              )),
              Expanded(child: _buildStatCard(
                icon: Icons.schedule,
                value: recentReviews.toString(),
                label: 'Recent (30 days)',
                color: AppColors.info,
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
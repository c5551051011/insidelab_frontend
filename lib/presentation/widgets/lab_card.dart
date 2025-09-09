// presentation/widgets/lab_card.dart
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/lab.dart';
import 'rating_stars.dart';

class LabCard extends StatelessWidget {
  final Lab lab;
  final VoidCallback onTap;

  const LabCard({
    Key? key,
    required this.lab,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildAvatar(),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildLabInfo(),
                  ),
                  _buildRatingInfo(),
                ],
              ),
              const SizedBox(height: 16),
              if (lab.ratingBreakdown != null) ...[
                _buildRatingBreakdown(),
                const SizedBox(height: 16),
              ],
              _buildTags(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return CircleAvatar(
      radius: 30,
      backgroundColor: AppColors.primaryLight.withOpacity(0.2),
      child: Text(
        lab.name.substring(0, 2).toUpperCase(),
        style: const TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
    );
  }

  Widget _buildLabInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lab.name,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Text(
          '${lab.professorName} • ${lab.universityName}',
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            const Icon(
              Icons.science_outlined,
              size: 16,
              color: AppColors.textTertiary,
            ),
            const SizedBox(width: 4),
            Text(
              lab.department,
              style: const TextStyle(
                color: AppColors.textTertiary,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRatingInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Row(
          children: [
            RatingStars(rating: lab.overallRating, size: 20),
            const SizedBox(width: 8),
            Text(
              lab.overallRating.toStringAsFixed(1),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          '${lab.reviewCount} reviews',
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildTags() {
    return Row(
      children: [
        // Recruitment status indicators
        if (lab.recruitmentStatus != null) ...[
          if (lab.recruitmentStatus!.isRecruitingPhD)
            _buildRecruitmentTag('PhD', AppColors.success),
          if (lab.recruitmentStatus!.isRecruitingPostdoc)
            _buildRecruitmentTag('Postdoc', AppColors.info),
          if (lab.recruitmentStatus!.isRecruitingIntern)
            _buildRecruitmentTag('Intern', AppColors.warning),
          const SizedBox(width: 8),
        ],
        // Regular tags
        Expanded(
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: lab.tags.take(3).map((tag) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primaryLight.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  tag,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildRatingBreakdown() {
    if (lab.ratingBreakdown == null || lab.ratingBreakdown!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rating Breakdown',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        ...lab.ratingBreakdown!.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                SizedBox(
                  width: 120,
                  child: Text(
                    entry.key,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                RatingStars(rating: entry.value, size: 14),
                const SizedBox(width: 6),
                Text(
                  entry.value.toStringAsFixed(1),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  width: 60,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: entry.value / 5.0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: _getRatingColor(entry.value),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.5) return AppColors.success;
    if (rating >= 3.5) return AppColors.warning;
    return AppColors.error;
  }

  Widget _buildRecruitmentTag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.person_add,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}


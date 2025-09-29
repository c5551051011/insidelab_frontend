// presentation/widgets/lab_card.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/lab.dart';
import '../../data/providers/saved_labs_provider.dart';
import '../../data/providers/data_providers.dart';
import 'enhanced_bookmark_button.dart';
import 'rating_stars.dart';

class LabCard extends StatelessWidget {
  final Lab lab;
  final VoidCallback onTap;
  final String? highlightQuery;

  const LabCard({
    Key? key,
    required this.lab,
    required this.onTap,
    this.highlightQuery,
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildAvatar(),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 3,
                    child: _buildLabInfo(),
                  ),
                  Flexible(
                    flex: 1,
                    child: _buildRatingInfo(context),
                  ),
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
        _buildHighlightedText(
          '${lab.professorName} • ${lab.universityName}',
          const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        _buildHighlightedText(
          lab.name,
          const TextStyle(
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
            Expanded(
              child: _buildHighlightedText(
                lab.hierarchyLine,
                const TextStyle(
                  color: AppColors.textTertiary,
                  fontSize: 12,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        if (lab.researchAreas.isNotEmpty) ...[
          const SizedBox(height: 4),
          SizedBox(
            width: double.infinity,
            child: _buildResearchAreas(),
          ),
        ],
      ],
    );
  }

  Widget _buildResearchAreas() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Wrap(
          spacing: 4,
          runSpacing: 4,
          children: lab.researchAreas.take(3).map((area) {
            final isHighlighted = highlightQuery != null &&
                highlightQuery!.isNotEmpty &&
                area.toLowerCase().contains(highlightQuery!.toLowerCase());

            return ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: constraints.maxWidth * 0.45, // Limit to 45% of available width
              ),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isHighlighted
                      ? AppColors.primary.withOpacity(0.2)
                      : AppColors.background,
                  borderRadius: BorderRadius.circular(8),
                  border: isHighlighted
                      ? Border.all(color: AppColors.primary, width: 1)
                      : null,
                ),
                child: Text(
                  area,
                  style: TextStyle(
                    color: isHighlighted ? AppColors.primary : AppColors.textTertiary,
                    fontSize: 10,
                    fontWeight: isHighlighted ? FontWeight.w600 : FontWeight.normal,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildHighlightedText(
    String text,
    TextStyle style, {
    int? maxLines,
    TextOverflow? overflow,
  }) {
    if (highlightQuery == null ||
        highlightQuery!.isEmpty ||
        !text.toLowerCase().contains(highlightQuery!.toLowerCase())) {
      return Text(
        text,
        style: style,
        maxLines: maxLines,
        overflow: overflow,
      );
    }

    final query = highlightQuery!.toLowerCase();
    final lowerText = text.toLowerCase();
    final spans = <TextSpan>[];

    int start = 0;
    int index = lowerText.indexOf(query);

    while (index != -1) {
      // Add text before the match
      if (index > start) {
        spans.add(TextSpan(
          text: text.substring(start, index),
          style: style,
        ));
      }

      // Add highlighted match
      spans.add(TextSpan(
        text: text.substring(index, index + query.length),
        style: style.copyWith(
          backgroundColor: AppColors.primary.withOpacity(0.2),
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ));

      start = index + query.length;
      index = lowerText.indexOf(query, start);
    }

    // Add remaining text
    if (start < text.length) {
      spans.add(TextSpan(
        text: text.substring(start),
        style: style,
      ));
    }

    return RichText(
      text: TextSpan(children: spans),
      maxLines: maxLines,
      overflow: overflow ?? TextOverflow.ellipsis,
      softWrap: true,
    );
  }

  Widget _buildRatingInfo(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Check if we have very limited space
        final isVerySmall = constraints.maxWidth < 100;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Enhanced bookmark button with interest types
            EnhancedBookmarkButton(
              labId: lab.id,
              size: 24,
              showDropdown: true,
            ),
            if (isVerySmall)
              // Stack rating vertically when space is very limited
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    lab.overallRating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  RatingStars(rating: lab.overallRating, size: 16),
                ],
              )
            else
              // Use horizontal layout when space allows
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: RatingStars(rating: lab.overallRating, size: 20),
                  ),
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
      },
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


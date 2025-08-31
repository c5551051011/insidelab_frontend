// presentation/screens/lab_detail/lab_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:insidelab/presentation/widgets/rating_radar_chart.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../data/models/review.dart';
import 'widgets/lab_header.dart';
import 'widgets/rating_breakdown.dart';
import 'widgets/reviews_list.dart';

class LabDetailScreen extends StatelessWidget {
  final Lab lab;

  const LabDetailScreen({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Column(
              children: [
                LabHeader(lab: lab),
                const SizedBox(height: 24),
                _buildContent(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      expandedHeight: 200,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(lab.name),
        background: Container(
          decoration: const BoxDecoration(
            gradient: AppColors.primaryGradient,
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 1000) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 3,
                  child: Column(
                    children: [
                      if (lab.ratingBreakdown != null) ...[
                        RatingBreakdown(ratings: lab.ratingBreakdown!),
                        const SizedBox(height: 24),
                        //_buildRadarChart(),
                      ],
                      const SizedBox(height: 24),
                      _buildLabInfo(),
                      const SizedBox(height: 24),
                      _buildRecruitmentStatus(),
                      const SizedBox(height: 24),
                      _buildResearchTopics(),
                      const SizedBox(height: 24),
                      _buildRecentPublications(),
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  flex: 4,
                  child: ReviewsList(labId: lab.id),
                ),
              ],
            );
          } else {
            return Column(
              children: [
                if (lab.ratingBreakdown != null) ...[
                  RatingBreakdown(ratings: lab.ratingBreakdown!),
                  const SizedBox(height: 24),
                  // _buildRadarChart(),
                ],
                const SizedBox(height: 24),
                _buildLabInfo(),
                const SizedBox(height: 24),
                _buildRecruitmentStatus(),
                const SizedBox(height: 24),
                _buildResearchTopics(),
                const SizedBox(height: 24),
                _buildRecentPublications(),
                const SizedBox(height: 24),
                ReviewsList(labId: lab.id),
              ],
            );
          }
        },
      ),
    );
  }

  /*
  Widget _buildRadarChart() {
    if (lab.ratingBreakdown == null) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Rating Overview',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            Center(
              child: RatingRadarChart(
                ratings: lab.ratingBreakdown!,
                size: 250,
              ),
            ),
          ],
        ),
      ),
    );
  }
*/

  Widget _buildRecruitmentStatus() {
    if (lab.recruitmentStatus == null) return const SizedBox.shrink();

    final status = lab.recruitmentStatus!;

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
                  'Recruitment Status',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (status.lastUpdated != null)
                  Text(
                    'Updated ${_formatDate(status.lastUpdated!)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _buildRecruitmentItem('PhD Students', status.isRecruitingPhD),
            _buildRecruitmentItem('Postdocs', status.isRecruitingPostdoc),
            _buildRecruitmentItem('Undergraduate Interns', status.isRecruitingIntern),
            if (status.notes != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: AppColors.info),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        status.notes!,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecruitmentItem(String position, bool isRecruiting) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            isRecruiting ? Icons.check_circle : Icons.cancel,
            color: isRecruiting ? AppColors.success : AppColors.textTertiary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            position,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isRecruiting
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.textTertiary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              isRecruiting ? 'Open' : 'Closed',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isRecruiting ? AppColors.success : AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResearchTopics() {
    if (lab.researchTopics == null || lab.researchTopics!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Research Topics',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...lab.researchTopics!.map((topic) => _buildResearchTopic(topic)),
          ],
        ),
      ),
    );
  }

  Widget _buildResearchTopic(ResearchTopic topic) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            topic.title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            topic.description,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: topic.keywords.map((keyword) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondaryLight.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  keyword,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.secondary,
                  ),
                ),
              );
            }).toList(),
          ),
          if (topic.fundingInfo != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.monetization_on_outlined,
                  size: 16,
                  color: AppColors.success,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    topic.fundingInfo!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.success,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRecentPublications() {
    if (lab.recentPublications == null || lab.recentPublications!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recent Publications',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...lab.recentPublications!.take(5).map((pub) => _buildPublication(pub)),
            if (lab.website != null) ...[
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () {
                    // TODO: Open lab website
                  },
                  child: const Text('View All Publications →'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPublication(Publication pub) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            pub.title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            pub.authors.join(', '),
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                '${pub.venue} ${pub.year}',
                style: const TextStyle(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                  color: AppColors.textTertiary,
                ),
              ),
              if (pub.citations != null) ...[
                const SizedBox(width: 16),
                Icon(
                  Icons.format_quote,
                  size: 14,
                  color: AppColors.textTertiary,
                ),
                const SizedBox(width: 4),
                Text(
                  '${pub.citations} citations',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()} weeks ago';
    } else {
      return '${(difference.inDays / 30).floor()} months ago';
    }
  }

  Widget _buildLabInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lab Information',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (lab.description != null) ...[
              Text(lab.description!),
              const SizedBox(height: 16),
            ],
            _buildInfoRow('Department', lab.department),
            _buildInfoRow('Lab Size', '${lab.labSize ?? "Unknown"} members'),
            if (lab.website != null)
              _buildInfoRow('Website', lab.website!, isLink: true),
            const SizedBox(height: 16),
            const Text(
              'Research Areas',
              style: TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: lab.researchAreas.map((area) {
                return Chip(
                  label: Text(area),
                  backgroundColor: AppColors.primaryLight.withOpacity(0.1),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isLink = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: isLink
                ? Text(
              value,
              style: const TextStyle(
                color: AppColors.primary,
                decoration: TextDecoration.underline,
              ),
            )
                : Text(value),
          ),
        ],
      ),
    );
  }
}

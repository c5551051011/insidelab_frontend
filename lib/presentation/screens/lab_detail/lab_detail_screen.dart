// presentation/screens/lab_detail/lab_detail_screen.dart
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
                      if (lab.ratingBreakdown != null)
                        RatingBreakdown(ratings: lab.ratingBreakdown!),
                      const SizedBox(height: 24),
                      _buildLabInfo(),
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
                if (lab.ratingBreakdown != null)
                  RatingBreakdown(ratings: lab.ratingBreakdown!),
                const SizedBox(height: 24),
                _buildLabInfo(),
                const SizedBox(height: 24),
                ReviewsList(labId: lab.id),
              ],
            );
          }
        },
      ),
    );
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

// presentation/widgets/lab_interests_widget.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../data/providers/saved_labs_provider.dart';
import '../../services/saved_labs_service.dart';

class LabInterestsWidget extends StatelessWidget {
  const LabInterestsWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<SavedLabsProvider>(
      builder: (context, savedLabsProvider, child) {
        // Load saved labs if not already loaded
        if (!savedLabsProvider.hasLoadedSavedIds) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            savedLabsProvider.loadSavedLabs();
          });
        }

        final labInterests = savedLabsProvider.labInterests;
        final interestsByType = savedLabsProvider.interestsByType;
        final isLoading = savedLabsProvider.isLoading;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.bookmark, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Lab Interests',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (labInterests.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${labInterests.length}',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (labInterests.isNotEmpty)
                      TextButton(
                        onPressed: () {
                          context.go('/profile/saved-labs');
                        },
                        child: const Text('View All'),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                if (isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (labInterests.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.bookmark_border,
                          size: 48,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No Lab Interests Yet',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Start bookmarking labs you\'re interested in to keep track of them',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            context.go('/search');
                          },
                          icon: const Icon(Icons.search, size: 18),
                          label: const Text('Browse Labs'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Column(
                    children: _buildInterestSections(context, interestsByType, savedLabsProvider),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  List<Widget> _buildInterestSections(BuildContext context, Map<LabInterestType, List<LabInterest>> interestsByType, SavedLabsProvider savedLabsProvider) {
    final sections = <Widget>[];

    // Define the order and display properties for each interest type
    final typeOrder = [
      LabInterestType.application,
      LabInterestType.recruited,
      LabInterestType.watching,
      LabInterestType.general,
    ];

    for (final type in typeOrder) {
      final interests = interestsByType[type] ?? [];
      if (interests.isEmpty) continue;

      sections.add(_buildInterestTypeSection(context, type, interests, savedLabsProvider));
      if (sections.length < typeOrder.length) {
        sections.add(const SizedBox(height: 16));
      }
    }

    return sections;
  }

  Widget _buildInterestTypeSection(BuildContext context, LabInterestType type, List<LabInterest> interests, SavedLabsProvider savedLabsProvider) {
    final typeInfo = _getInterestTypeInfo(type);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: typeInfo['color'].withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: typeInfo['color'].withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                typeInfo['icon'],
                color: typeInfo['color'],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                typeInfo['label'],
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: typeInfo['color'].withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${interests.length}',
                  style: TextStyle(
                    color: typeInfo['color'],
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...interests.take(2).map((interest) => _buildLabInterestCard(interest, context, savedLabsProvider)),
          if (interests.length > 2) ...[
            const SizedBox(height: 8),
            Center(
              child: TextButton.icon(
                onPressed: () {
                  context.go('/profile/saved-labs?type=${type.value}');
                },
                icon: const Icon(Icons.expand_more, size: 16),
                label: Text('View ${interests.length - 2} more'),
                style: TextButton.styleFrom(
                  foregroundColor: typeInfo['color'],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Map<String, dynamic> _getInterestTypeInfo(LabInterestType type) {
    switch (type) {
      case LabInterestType.general:
        return {
          'label': 'General Interest',
          'icon': Icons.bookmark,
          'color': AppColors.primary,
        };
      case LabInterestType.application:
        return {
          'label': 'Want to Apply',
          'icon': Icons.send,
          'color': AppColors.warning,
        };
      case LabInterestType.watching:
        return {
          'label': 'Watching',
          'icon': Icons.visibility,
          'color': AppColors.info,
        };
      case LabInterestType.recruited:
        return {
          'label': 'Recruited',
          'icon': Icons.how_to_reg,
          'color': AppColors.success,
        };
    }
  }

  Widget _buildLabInterestCard(LabInterest interest, BuildContext context, SavedLabsProvider savedLabsProvider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        onTap: () {
          context.go('/lab/${interest.labId}');
        },
        borderRadius: BorderRadius.circular(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        interest.labName,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${interest.labProfessor} • ${interest.labUniversity}',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.star, size: 12, color: AppColors.warning),
                          const SizedBox(width: 2),
                          Text(
                            interest.labRating.toStringAsFixed(1),
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert, size: 16, color: AppColors.textSecondary),
                  onSelected: (value) {
                    switch (value) {
                      case 'view':
                        context.go('/lab/${interest.labId}');
                        break;
                      case 'remove':
                        _showRemoveLabDialog(context, interest, savedLabsProvider);
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [
                          Icon(Icons.open_in_new, size: 14),
                          SizedBox(width: 6),
                          Text('View Lab'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'remove',
                      child: Row(
                        children: [
                          Icon(Icons.bookmark_remove, size: 14, color: AppColors.error),
                          SizedBox(width: 6),
                          Text('Remove', style: TextStyle(color: AppColors.error)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showRemoveLabDialog(BuildContext context, LabInterest interest, SavedLabsProvider savedLabsProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Lab Interest'),
        content: Text('Remove "${interest.labName}" from your interests?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await savedLabsProvider.removeLabInterest(interest.labId.toString());
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success
                        ? 'Lab removed from interests'
                        : 'Failed to remove lab'),
                    backgroundColor: success ? AppColors.success : AppColors.error,
                  ),
                );
              }
            },
            child: const Text('Remove', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
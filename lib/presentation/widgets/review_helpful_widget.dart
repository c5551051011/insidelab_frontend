// presentation/widgets/review_helpful_widget.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/review.dart';
import '../../data/providers/data_providers.dart';
import '../../services/review_helpful_service.dart';

class ReviewHelpfulWidget extends StatefulWidget {
  final Review review;
  final Function(Review)? onReviewUpdated;

  const ReviewHelpfulWidget({
    Key? key,
    required this.review,
    this.onReviewUpdated,
  }) : super(key: key);

  @override
  State<ReviewHelpfulWidget> createState() => _ReviewHelpfulWidgetState();
}

class _ReviewHelpfulWidgetState extends State<ReviewHelpfulWidget> {
  late Review _currentReview;
  bool _isVoting = false;

  @override
  void initState() {
    super.initState();
    _currentReview = widget.review;
  }

  @override
  void didUpdateWidget(ReviewHelpfulWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.review != widget.review) {
      _currentReview = widget.review;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final isAuthenticated = authProvider.isAuthenticated;
        final helpfulCount = _currentReview.helpfulCount;
        final userVote = _currentReview.userVote;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              // Check available space and adapt accordingly
              final hasLimitedSpace = constraints.maxWidth < 300;

              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Helpful count display
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.thumb_up_outlined,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$helpfulCount',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (!hasLimitedSpace) ...[
                        const SizedBox(width: 4),
                        Text(
                          'helpful',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),

                  SizedBox(width: hasLimitedSpace ? 8 : 16),

                  // Voting buttons
                  if (isAuthenticated) ...[
                    Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (!hasLimitedSpace) ...[
                            Text(
                              'Was this helpful?',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],

                          // Yes button
                          _buildVoteButton(
                            icon: Icons.thumb_up,
                            label: hasLimitedSpace ? '' : 'Yes',
                            isSelected: userVote == true,
                            onPressed: _isVoting ? null : () => _handleVote(true),
                          ),

                          const SizedBox(width: 4),

                          // No button
                          _buildVoteButton(
                            icon: Icons.thumb_down,
                            label: hasLimitedSpace ? '' : 'No',
                            isSelected: userVote == false,
                            onPressed: _isVoting ? null : () => _handleVote(false),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    Flexible(
                      child: Text(
                        'Sign in to vote',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textTertiary,
                          fontStyle: FontStyle.italic,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildVoteButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback? onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            if (label.isNotEmpty) ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _handleVote(bool isHelpful) async {
    if (_isVoting) return;

    setState(() {
      _isVoting = true;
    });

    try {
      final result = await ReviewHelpfulService.voteOnReview(
        _currentReview.id,
        isHelpful,
      );

      if (result != null && mounted) {
        final updatedReview = _currentReview.copyWith(
          helpfulCount: result.helpfulCount,
          userVote: result.userVote,
        );

        setState(() {
          _currentReview = updatedReview;
        });

        // Notify parent widget about the update
        widget.onReviewUpdated?.call(updatedReview);

        // Show success feedback
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isHelpful ? 'Marked as helpful' : 'Marked as not helpful',
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      } else if (mounted) {
        // Show error feedback
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to vote. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to vote. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isVoting = false;
        });
      }
    }
  }
}

// Compact version for use in smaller spaces
class ReviewHelpfulCompact extends StatelessWidget {
  final Review review;
  final Function(Review)? onReviewUpdated;

  const ReviewHelpfulCompact({
    Key? key,
    required this.review,
    this.onReviewUpdated,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.thumb_up_outlined,
          size: 14,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          '${review.helpfulCount}',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        if (review.userVote != null) ...[
          const SizedBox(width: 8),
          Icon(
            review.userVote! ? Icons.thumb_up : Icons.thumb_down,
            size: 12,
            color: AppColors.primary,
          ),
        ],
      ],
    );
  }
}
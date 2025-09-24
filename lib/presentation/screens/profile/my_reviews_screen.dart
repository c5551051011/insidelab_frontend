import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/review.dart';
import '../../../data/repositories/review_repository.dart';
import '../../widgets/common/header_navigation.dart';

class MyReviewsScreen extends StatefulWidget {
  const MyReviewsScreen({Key? key}) : super(key: key);

  @override
  State<MyReviewsScreen> createState() => _MyReviewsScreenState();
}

class _MyReviewsScreenState extends State<MyReviewsScreen> {
  List<Review> _userReviews = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserReviews();
  }

  Future<void> _loadUserReviews() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final currentUser = authProvider.currentUser;

      if (currentUser != null) {
        // Load real user reviews from backend
        final reviewRepository = ReviewRepositoryImpl();
        _userReviews = await reviewRepository.getUserReviews(currentUser.id);
      }
    } catch (e) {
      print('Error loading user reviews: $e');
      _userReviews = [];
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          
          if (user == null) {
            return const Center(
              child: Text('Please sign in to view your reviews'),
            );
          }

          if (_isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (_userReviews.isEmpty) {
            return _buildEmptyState(context);
          }

          return Column(
            children: [
              _buildHeader(),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _userReviews.length,
                  itemBuilder: (context, index) {
                    return _buildReviewCard(_userReviews[index]);
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: AppColors.primary.withOpacity(0.1),
      child: Column(
        children: [
          Text(
            '${_userReviews.length} Reviews',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thank you for contributing to the community!',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.rate_review,
              size: 80,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 24),
            Text(
              'No Reviews Yet',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Share your lab experiences to help other students make informed decisions.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
              child: const Text('Browse Labs to Review'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(Review review) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildReviewHeader(review),
            const SizedBox(height: 16),
            _buildRatingSection(review),
            const SizedBox(height: 16),
            _buildReviewContent(review),
            const SizedBox(height: 16),
            _buildReviewStats(review),
            const SizedBox(height: 12),
            _buildReviewActions(review),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewHeader(Review review) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            'Lab ID: ${review.labId}', // TODO: Show actual lab name
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
        const Spacer(),
        Text(
          _formatDate(review.reviewDate),
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildRatingSection(Review review) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _getRatingColor(review.rating).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.star,
                color: _getRatingColor(review.rating),
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                review.rating.toStringAsFixed(1),
                style: TextStyle(
                  color: _getRatingColor(review.rating),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Text(
          '${review.position} • ${review.duration}',
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildReviewContent(Review review) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          review.reviewText,
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textPrimary,
            height: 1.5,
          ),
        ),
        if (review.pros.isNotEmpty) ...[
          const SizedBox(height: 16),
          _buildProsCons('Pros', review.pros, AppColors.success),
        ],
        if (review.cons.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildProsCons('Cons', review.cons, AppColors.error),
        ],
      ],
    );
  }

  Widget _buildProsCons(String title, List<String> items, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 4),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 8),
                width: 4,
                height: 4,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  item,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildReviewStats(Review review) {
    return Row(
      children: [
        Icon(
          Icons.thumb_up,
          size: 16,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          '${review.helpfulCount} helpful',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(width: 16),
        if (review.isVerified)
          Row(
            children: [
              Icon(
                Icons.verified,
                size: 16,
                color: AppColors.success,
              ),
              const SizedBox(width: 4),
              Text(
                'Verified',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildReviewActions(Review review) {
    return Row(
      children: [
        TextButton.icon(
          onPressed: () {
            _showEditDialog(review);
          },
          icon: const Icon(Icons.edit, size: 16),
          label: const Text('Edit'),
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
          ),
        ),
        const SizedBox(width: 16),
        TextButton.icon(
          onPressed: () {
            _showDeleteDialog(review);
          },
          icon: const Icon(Icons.delete, size: 16, color: AppColors.error),
          label: const Text('Delete', style: TextStyle(color: AppColors.error)),
          style: TextButton.styleFrom(
            padding: EdgeInsets.zero,
          ),
        ),
      ],
    );
  }

  void _showEditDialog(Review review) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Review'),
        content: const Text('Review editing functionality coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(Review review) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Review'),
        content: const Text('Are you sure you want to delete this review? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _userReviews.removeWhere((r) => r.id == review.id);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Review deleted')),
              );
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.0) return AppColors.success;
    if (rating >= 3.0) return Colors.orange;
    return AppColors.error;
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
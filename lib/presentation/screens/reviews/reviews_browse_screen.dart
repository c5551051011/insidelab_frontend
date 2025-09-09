// presentation/screens/reviews/reviews_browse_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/review.dart';
import '../../../data/models/lab.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/common/loading_state.dart';
import '../../widgets/review_card.dart';
import 'widgets/review_filters.dart';
import 'widgets/review_stats.dart';

class ReviewsBrowseScreen extends StatefulWidget {
  final String? initialQuery;
  final String? initialLabId;

  const ReviewsBrowseScreen({
    Key? key,
    this.initialQuery,
    this.initialLabId,
  }) : super(key: key);

  @override
  State<ReviewsBrowseScreen> createState() => _ReviewsBrowseScreenState();
}

class _ReviewsBrowseScreenState extends State<ReviewsBrowseScreen> with SingleTickerProviderStateMixin {
  late TextEditingController _searchController;
  late TabController _tabController;
  
  String _sortBy = 'recent';
  Map<String, dynamic> _filters = {};
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery);
    _tabController = TabController(length: 3, vsync: this);
    
    if (widget.initialLabId != null) {
      _filters['labId'] = widget.initialLabId;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Column(
        children: [
          _buildHeader(context),
          _buildStatsSection(),
          _buildTabBar(),
          if (_showFilters) _buildFiltersPanel(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildReviewsList(context, 'all'),
                _buildReviewsList(context, 'recent'),
                _buildReviewsList(context, 'top_rated'),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isAuthenticated) {
            return FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/write-review'),
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.rate_review, color: Colors.white),
              label: const Text(
                'Write Review',
                style: TextStyle(color: Colors.white),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Browse Reviews',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Discover honest insights from graduate students about labs, professors, and programs',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () => _showHowItWorks(context),
                    icon: const Icon(Icons.help_outline, size: 18),
                    label: const Text('How it works'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSearchBar(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search reviews, labs, professors...',
                hintStyle: TextStyle(color: AppColors.textSecondary),
                prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, color: AppColors.textSecondary),
                        onPressed: () {
                          _searchController.clear();
                          _searchReviews();
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              ),
              onSubmitted: (query) => _searchReviews(),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Container(
          decoration: BoxDecoration(
            color: _showFilters ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _showFilters ? AppColors.primary : AppColors.border,
            ),
          ),
          child: IconButton(
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
            icon: Icon(
              Icons.tune,
              color: _showFilters ? Colors.white : AppColors.textSecondary,
            ),
          ),
        ),
        const SizedBox(width: 8),
        _buildSortDropdown(),
      ],
    );
  }

  Widget _buildSortDropdown() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButton<String>(
        value: _sortBy,
        underline: const SizedBox(),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        items: const [
          DropdownMenuItem(value: 'recent', child: Text('Most Recent')),
          DropdownMenuItem(value: 'rating', child: Text('Highest Rated')),
          DropdownMenuItem(value: 'helpful', child: Text('Most Helpful')),
          DropdownMenuItem(value: 'oldest', child: Text('Oldest First')),
        ],
        onChanged: (value) {
          setState(() {
            _sortBy = value!;
          });
          _searchReviews();
        },
      ),
    );
  }

  Widget _buildStatsSection() {
    final reviews = _getDemoReviews();
    return ReviewStats(
      totalReviews: reviews.length,
      averageRating: _calculateAverageRating(reviews),
      verifiedReviews: reviews.where((r) => r.isVerified).length,
      recentReviews: reviews.where((r) => 
        r.reviewDate.isAfter(DateTime.now().subtract(const Duration(days: 30)))
      ).length,
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: TabBar(
        controller: _tabController,
        tabs: const [
          Tab(text: 'All Reviews'),
          Tab(text: 'Recent'),
          Tab(text: 'Top Rated'),
        ],
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
      ),
    );
  }

  Widget _buildFiltersPanel() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: ReviewFilters(
        filters: _filters,
        onFiltersChanged: (newFilters) {
          setState(() {
            _filters = newFilters;
          });
          _searchReviews();
        },
      ),
    );
  }

  Widget _buildReviewsList(BuildContext context, String type) {
    return Consumer<ReviewProvider>(
      builder: (context, reviewProvider, child) {
        if (reviewProvider.isLoading) {
          return const LoadingState(message: 'Loading reviews...');
        }

        if (reviewProvider.error != null) {
          return _buildErrorState(reviewProvider.error!);
        }

        List<Review> reviews = _getFilteredReviews(_getDemoReviews(), type);
        
        if (reviews.isEmpty) {
          return _buildEmptyState(type);
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${reviews.length} reviews found',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (_filters.isNotEmpty)
                        TextButton(
                          onPressed: _clearFilters,
                          child: const Text('Clear filters'),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...reviews.map((review) => Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: InkWell(
                      onTap: () => _viewReviewDetails(context, review),
                      borderRadius: BorderRadius.circular(12),
                      child: ReviewCard(review: review),
                    ),
                  )),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            'Failed to load reviews',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: TextStyle(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _searchReviews,
            child: const Text('Try Again'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String type) {
    String title, subtitle;
    
    switch (type) {
      case 'recent':
        title = 'No Recent Reviews';
        subtitle = 'No reviews have been posted in the last 30 days.';
        break;
      case 'top_rated':
        title = 'No Top Rated Reviews';
        subtitle = 'No highly rated reviews match your criteria.';
        break;
      default:
        title = 'No Reviews Found';
        subtitle = 'Try adjusting your search terms or filters to find more reviews.';
    }

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.rate_review_outlined, size: 80, color: AppColors.textTertiary),
            const SizedBox(height: 24),
            Text(
              title,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                if (authProvider.isAuthenticated) {
                  return ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/write-review'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Write the First Review'),
                  );
                }
                return OutlinedButton(
                  onPressed: () => Navigator.pushNamed(context, '/sign-in'),
                  child: const Text('Sign In to Write Review'),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  List<Review> _getFilteredReviews(List<Review> allReviews, String type) {
    List<Review> filtered = allReviews;

    // Apply type filter
    switch (type) {
      case 'recent':
        filtered = filtered.where((r) => 
          r.reviewDate.isAfter(DateTime.now().subtract(const Duration(days: 30)))
        ).toList();
        break;
      case 'top_rated':
        filtered = filtered.where((r) => r.rating >= 4.0).toList();
        break;
    }

    // Apply search filter
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((r) => 
        r.reviewText.toLowerCase().contains(query) ||
        r.pros.any((p) => p.toLowerCase().contains(query)) ||
        r.cons.any((c) => c.toLowerCase().contains(query))
      ).toList();
    }

    // Apply additional filters
    if (_filters['position'] != null) {
      filtered = filtered.where((r) => r.position == _filters['position']).toList();
    }
    
    if (_filters['minRating'] != null) {
      filtered = filtered.where((r) => r.rating >= _filters['minRating']).toList();
    }

    if (_filters['verified'] == true) {
      filtered = filtered.where((r) => r.isVerified).toList();
    }

    // Apply sorting
    switch (_sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.reviewDate.compareTo(a.reviewDate));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulCount.compareTo(a.helpfulCount));
        break;
      case 'oldest':
        filtered.sort((a, b) => a.reviewDate.compareTo(b.reviewDate));
        break;
    }

    return filtered;
  }

  List<Review> _getDemoReviews() {
    return [
      Review(
        id: '1',
        labId: 'lab1',
        userId: 'user1',
        position: 'PhD Student',
        duration: '3 years',
        reviewDate: DateTime.now().subtract(const Duration(days: 15)),
        rating: 4.5,
        categoryRatings: {
          'Mentorship': 4.0,
          'Research Environment': 5.0,
          'Work-Life Balance': 4.0,
          'Career Support': 4.5,
        },
        reviewText: 'Amazing research environment with cutting-edge projects. Professor is very supportive and provides excellent mentorship. Lab culture is collaborative and everyone helps each other.',
        pros: [
          'Excellent mentorship from PI',
          'State-of-the-art equipment',
          'Collaborative lab culture',
          'Strong publication record',
        ],
        cons: [
          'High expectations',
          'Competitive atmosphere',
        ],
        helpfulCount: 23,
        isVerified: true,
      ),
      Review(
        id: '2',
        labId: 'lab2',
        userId: 'user2',
        position: 'MS Student',
        duration: '2 years',
        reviewDate: DateTime.now().subtract(const Duration(days: 45)),
        rating: 3.5,
        categoryRatings: {
          'Mentorship': 3.0,
          'Research Environment': 4.0,
          'Work-Life Balance': 3.5,
          'Career Support': 3.0,
        },
        reviewText: 'Good lab for getting research experience, but mentorship could be better. Professor is often busy and doesn\'t have much time for individual students.',
        pros: [
          'Interesting research projects',
          'Good lab facilities',
          'Flexible schedule',
        ],
        cons: [
          'Limited mentorship',
          'Professor often unavailable',
          'Unclear expectations',
        ],
        helpfulCount: 12,
        isVerified: true,
      ),
      Review(
        id: '3',
        labId: 'lab1',
        userId: 'user3',
        position: 'PostDoc',
        duration: '1.5 years',
        reviewDate: DateTime.now().subtract(const Duration(days: 80)),
        rating: 5.0,
        categoryRatings: {
          'Mentorship': 5.0,
          'Research Environment': 5.0,
          'Work-Life Balance': 4.5,
          'Career Support': 5.0,
        },
        reviewText: 'Exceptional lab with world-class research. Professor provides incredible support for career development and is always available for discussions. Highly recommend!',
        pros: [
          'World-class research',
          'Outstanding mentorship',
          'Excellent career support',
          'International collaborations',
          'Great funding',
        ],
        cons: [
          'Very competitive',
        ],
        helpfulCount: 45,
        isVerified: true,
      ),
    ];
  }

  double _calculateAverageRating(List<Review> reviews) {
    if (reviews.isEmpty) return 0.0;
    return reviews.fold(0.0, (sum, r) => sum + r.rating) / reviews.length;
  }

  void _searchReviews() {
    // TODO: Implement actual search with provider
    setState(() {});
  }

  void _clearFilters() {
    setState(() {
      _filters = {};
      _searchController.clear();
    });
    _searchReviews();
  }

  void _viewReviewDetails(BuildContext context, Review review) {
    Navigator.pushNamed(
      context,
      '/review-details',
      arguments: review,
    );
  }

  void _showHowItWorks(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('How Reviews Work'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('📝 **Write honest reviews** about your lab experience'),
            const SizedBox(height: 8),
            const Text('✅ **Get verified** by confirming your university email'),
            const SizedBox(height: 8),
            const Text('🔍 **Browse reviews** to make informed decisions'),
            const SizedBox(height: 8),
            const Text('👍 **Help others** by voting on helpful reviews'),
            const SizedBox(height: 16),
            Text(
              'All reviews are anonymous and help future graduate students make better decisions.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }
}
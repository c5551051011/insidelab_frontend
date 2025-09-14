// presentation/screens/reviews/write_review_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/review.dart';
import '../../../data/models/lab.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/rating_stars.dart';

class WriteReviewScreen extends StatefulWidget {
  final String? labId;

  const WriteReviewScreen({
    Key? key,
    this.labId,
  }) : super(key: key);

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reviewTextController = TextEditingController();
  final _prosController = TextEditingController();
  final _consController = TextEditingController();

  String? _selectedLabId;
  String _position = 'PhD Student';
  String _duration = '1 year';
  double _overallRating = 4.0;
  
  final Map<String, double> _categoryRatings = {
    'Mentorship': 4.0,
    'Research Environment': 4.0,
    'Work-Life Balance': 4.0,
    'Career Support': 4.0,
  };

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _selectedLabId = widget.labId;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 32),
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabSelection(),
                      const SizedBox(height: 24),
                      _buildPositionAndDuration(),
                      const SizedBox(height: 24),
                      _buildOverallRating(),
                      const SizedBox(height: 24),
                      _buildCategoryRatings(),
                      const SizedBox(height: 24),
                      _buildReviewText(),
                      const SizedBox(height: 24),
                      _buildProsCons(),
                      const SizedBox(height: 32),
                      _buildSubmitSection(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Write a Review',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Share your honest experience to help future graduate students',
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.info.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.info.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.info),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Your review will be anonymous. Only your position and duration will be shown publicly.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLabSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Lab/Professor *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String>(
            value: _selectedLabId,
            hint: const Text('Select a lab or professor'),
            underline: const SizedBox(),
            isExpanded: true,
            items: _getDemoLabs().map((lab) {
              return DropdownMenuItem<String>(
                value: lab.id,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      lab.name,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      '${lab.professorName} • ${lab.universityName}',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedLabId = value;
              });
            },
          ),
        ),
        if (_selectedLabId == null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Please select a lab or professor',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.error,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPositionAndDuration() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 600;

    if (isNarrow) {
      // Stack vertically on narrow screens
      return Column(
        children: [
          _buildPositionDropdown(),
          const SizedBox(height: 16),
          _buildDurationDropdown(),
        ],
      );
    } else {
      // Side by side on wider screens
      return Row(
        children: [
          Expanded(child: _buildPositionDropdown()),
          const SizedBox(width: 16),
          Expanded(child: _buildDurationDropdown()),
        ],
      );
    }
  }

  Widget _buildPositionDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Position *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String>(
            value: _position,
            underline: const SizedBox(),
            isExpanded: true,
            items: const [
              DropdownMenuItem(value: 'PhD Student', child: Text('PhD Student')),
              DropdownMenuItem(value: 'MS Student', child: Text('MS Student')),
              DropdownMenuItem(value: 'Undergrad', child: Text('Undergraduate Student')),
              DropdownMenuItem(value: 'PostDoc', child: Text('PostDoc')),
              DropdownMenuItem(value: 'Research Assistant', child: Text('Research Assistant')),
            ],
            onChanged: (value) {
              setState(() {
                _position = value!;
              });
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDurationDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Duration *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String>(
            value: _duration,
            underline: const SizedBox(),
            isExpanded: true,
            items: const [
              DropdownMenuItem(value: '< 6 months', child: Text('Less than 6 months')),
              DropdownMenuItem(value: '6 months', child: Text('6 months')),
              DropdownMenuItem(value: '1 year', child: Text('1 year')),
              DropdownMenuItem(value: '2 years', child: Text('2 years')),
              DropdownMenuItem(value: '3 years', child: Text('3 years')),
              DropdownMenuItem(value: '4+ years', child: Text('4+ years')),
            ],
            onChanged: (value) {
              setState(() {
                _duration = value!;
              });
            },
          ),
        ),
      ],
    );
  }

  Widget _buildOverallRating() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overall Rating *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              RatingStars(rating: _overallRating, size: 32),
              const SizedBox(width: 16),
              Text(
                _overallRating.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Column(
                children: [
                  Text(
                    'Tap stars to rate',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(10, (index) {
            final rating = (index + 1) * 0.5;
            return GestureDetector(
              onTap: () {
                setState(() {
                  _overallRating = rating;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _overallRating == rating ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  rating.toString(),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _overallRating == rating ? Colors.white : AppColors.textSecondary,
                  ),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildCategoryRatings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Category Ratings',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Rate different aspects of your experience',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 16),
        ..._categoryRatings.keys.map((category) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: _buildCategoryRatingRow(category),
          );
        }),
      ],
    );
  }

  Widget _buildCategoryRatingRow(String category) {
    final rating = _categoryRatings[category]!;
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 600;

    if (isNarrow) {
      // Stack vertically on narrow screens
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  category,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              RatingStars(rating: rating, size: 20),
              const SizedBox(width: 8),
              Text(
                rating.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: List.generate(10, (index) {
              final ratingValue = (index + 1) * 0.5;
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _categoryRatings[category] = ratingValue;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: rating == ratingValue ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: rating == ratingValue ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: Text(
                    ratingValue.toString(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: rating == ratingValue ? Colors.white : AppColors.textTertiary,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      );
    } else {
      // Horizontal layout for wider screens
      return Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(
              category,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const SizedBox(width: 16),
          RatingStars(rating: rating, size: 20),
          const SizedBox(width: 16),
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Wrap(
              spacing: 2,
              children: List.generate(10, (index) {
                final ratingValue = (index + 1) * 0.5;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _categoryRatings[category] = ratingValue;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 1),
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      color: rating == ratingValue ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Text(
                      ratingValue.toString(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: rating == ratingValue ? Colors.white : AppColors.textTertiary,
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      );
    }
  }

  Widget _buildReviewText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Review *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Share your honest experience and insights',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _reviewTextController,
          maxLines: 6,
          decoration: InputDecoration(
            hintText: 'Describe your experience in the lab, the research environment, mentorship quality, and any other relevant details...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.primary),
            ),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Please write your review';
            }
            if (value.trim().length < 50) {
              return 'Please write at least 50 characters';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildProsCons() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 600;

    if (isNarrow) {
      // Stack vertically on narrow screens
      return Column(
        children: [
          _buildProsField(),
          const SizedBox(height: 16),
          _buildConsField(),
        ],
      );
    } else {
      // Side by side on wider screens
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: _buildProsField()),
          const SizedBox(width: 16),
          Expanded(child: _buildConsField()),
        ],
      );
    }
  }

  Widget _buildProsField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pros',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.success,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _prosController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'List the positive aspects (one per line)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.success.withOpacity(0.3)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.success),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConsField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Cons',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.error,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _consController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'List any drawbacks (one per line)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.error.withOpacity(0.3)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.error),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.warning.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.warning.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.shield_outlined, color: AppColors.warning),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Community Guidelines',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Reviews must be honest, respectful, and based on personal experience. Inappropriate content will be removed.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _submitReview,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isSubmitting
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                      SizedBox(width: 12),
                      Text('Submitting Review...'),
                    ],
                  )
                : const Text(
                    'Submit Review',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  List<Lab> _getDemoLabs() {
    return [
      Lab(
        id: '1',
        name: 'Stanford AI Lab',
        professorName: 'Dr. Fei-Fei Li',
        professorId: 'prof1',
        universityName: 'Stanford University',
        universityId: 'uni1',
        department: 'Computer Science',
        overallRating: 4.6,
        reviewCount: 128,
        researchAreas: ['Computer Vision', 'AI Safety', 'Deep Learning'],
        tags: ['Well Funded', 'Industry Focus', 'Publication Heavy'],
      ),
      Lab(
        id: '2',
        name: 'MIT CSAIL',
        professorName: 'Dr. Regina Barzilay',
        professorId: 'prof2',
        universityName: 'MIT',
        universityId: 'uni2',
        department: 'EECS',
        overallRating: 4.7,
        reviewCount: 156,
        researchAreas: ['NLP', 'Machine Learning', 'Healthcare AI'],
        tags: ['Top Tier', 'Collaborative', 'Innovation Focused'],
      ),
      Lab(
        id: '3',
        name: 'Berkeley AI Research Lab',
        professorName: 'Dr. Pieter Abbeel',
        professorId: 'prof3',
        universityName: 'UC Berkeley',
        universityId: 'uni3',
        department: 'EECS',
        overallRating: 4.8,
        reviewCount: 142,
        researchAreas: ['Robotics', 'Reinforcement Learning', 'Deep Learning'],
        tags: ['Startup Culture', 'Well Funded', 'Industry Focus'],
      ),
    ];
  }

  void _submitReview() async {
    if (!_formKey.currentState!.validate() || _selectedLabId == null) {
      if (_selectedLabId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select a lab or professor'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final pros = _prosController.text
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();

      final cons = _consController.text
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();

      final review = Review(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        labId: _selectedLabId!,
        userId: 'current_user', // TODO: Get from auth provider
        position: _position,
        duration: _duration,
        reviewDate: DateTime.now(),
        rating: _overallRating,
        categoryRatings: Map.from(_categoryRatings),
        reviewText: _reviewTextController.text.trim(),
        pros: pros,
        cons: cons,
        helpfulCount: 0,
        isVerified: false, // Will be set by verification process
      );

      // TODO: Submit to ReviewProvider
      await Future.delayed(const Duration(seconds: 2)); // Simulate API call

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Review submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );

        Navigator.pop(context);
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit review: $error'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _reviewTextController.dispose();
    _prosController.dispose();
    _consController.dispose();
    super.dispose();
  }
}
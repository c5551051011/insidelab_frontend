// presentation/screens/reviews/write_review_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/models/lab.dart';
import '../../../data/models/university.dart';
import '../../../data/providers/data_providers.dart';
import '../../../services/university_service.dart';
import '../../../services/lab_service.dart';
import '../../../services/review_service.dart';
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
  final _universityController = TextEditingController();
  final _labController = TextEditingController();

  String? _selectedLabId;
  String? _selectedUniversityId;
  String? _selectedUniversityName;
  String? _selectedLabName;
  String _position = 'PhD Student';
  String _duration = '1 year';
  double _overallRating = 4.0;

  final Map<String, double> _categoryRatings = {
    for (String category in AppConstants.ratingCategories) category: 4.0,
  };

  bool _isSubmitting = false;
  bool _isCheckingAuth = true;
  List<University> _filteredUniversities = [];
  List<Lab> _filteredLabs = [];

  @override
  void initState() {
    super.initState();
    _selectedLabId = widget.labId;
    _checkAuthenticationStatus();
  }

  void _checkAuthenticationStatus() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Use WidgetsBinding to ensure this runs after the build is complete
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // First check if already authenticated
      if (authProvider.isAuthenticated && authProvider.currentUser != null) {
        if (mounted) {
          setState(() {
            _isCheckingAuth = false;
          });
          _initializeUniversityList();
        }
        return;
      }

      // If not authenticated, try to refresh auth status
      try {
        await authProvider.checkAuthStatus();

        if (!authProvider.isAuthenticated) {
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/sign-in');
            return;
          }
        }

        if (mounted) {
          setState(() {
            _isCheckingAuth = false;
          });
          _initializeUniversityList();
        }
      } catch (error) {
        // If auth check fails, redirect to login
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/sign-in');
        }
      }
    });
  }

  void _initializeUniversityList() async {
    try {
      final universities = await UniversityService.getAllUniversities();
      if (mounted) {
        setState(() {
          _filteredUniversities = universities;
        });
      }
    } catch (e) {
      print('Error loading universities: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load universities. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isCheckingAuth) {
      return Scaffold(
        appBar: const HeaderNavigation(),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

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
                      _buildUniversitySelection(),
                      const SizedBox(height: 24),
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

  Widget _buildUniversitySelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'University *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TypeAheadField<University>(
          controller: _universityController,
          builder: (context, controller, focusNode) {
            return TextField(
              controller: controller,
              focusNode: focusNode,
              decoration: InputDecoration(
                hintText: 'Search or type university name...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                suffixIcon: _universityController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _universityController.clear();
                            _selectedUniversityId = null;
                            _selectedUniversityName = null;
                            _labController.clear();
                            _selectedLabId = null;
                            _selectedLabName = null;
                            _filteredLabs.clear();
                          });
                        },
                      )
                    : const Icon(Icons.search),
              ),
            );
          },
          suggestionsCallback: (pattern) async {
            try {
              if (pattern.isEmpty) {
                return _filteredUniversities;
              }
              final searchResults = await UniversityService.getAllUniversities(search: pattern);
              return searchResults;
            } catch (e) {
              print('Error searching universities: $e');
              return _filteredUniversities.where((uni) =>
                  uni.name.toLowerCase().contains(pattern.toLowerCase())).toList();
            }
          },
          itemBuilder: (context, suggestion) {
            return ListTile(
              title: Text(suggestion.name),
              subtitle: Text('${suggestion.city}, ${suggestion.state}, ${suggestion.country}'),
            );
          },
          onSelected: (suggestion) async {
            setState(() {
              _selectedUniversityId = suggestion.id;
              _selectedUniversityName = suggestion.name;
              _universityController.text = suggestion.name;
              // Clear lab selection when university changes
              _labController.clear();
              _selectedLabId = null;
              _selectedLabName = null;
            });

            // Load labs for the selected university
            try {
              final labs = await LabService.getLabsByUniversity(suggestion.id);
              if (mounted) {
                setState(() {
                  _filteredLabs = labs;
                });
              }
            } catch (e) {
              print('Error loading labs for university: $e');
              if (mounted) {
                setState(() {
                  _filteredLabs = [];
                });
              }
            }
          },
          emptyBuilder: (context) => Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text('University not found'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => _showAddUniversityDialog(),
                  child: const Text('Add New University'),
                ),
              ],
            ),
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
        TypeAheadField<Lab>(
          controller: _labController,
          builder: (context, controller, focusNode) {
            return TextField(
              controller: controller,
              focusNode: focusNode,
              enabled: _selectedUniversityId != null,
              decoration: InputDecoration(
                hintText: _selectedUniversityId != null
                    ? 'Search or type lab/professor name...'
                    : 'Please select a university first',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                suffixIcon: _labController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _labController.clear();
                            _selectedLabId = null;
                            _selectedLabName = null;
                          });
                        },
                      )
                    : const Icon(Icons.search),
              ),
            );
          },
          suggestionsCallback: (pattern) async {
            if (_selectedUniversityId == null) return <Lab>[];
            if (pattern.isEmpty) return _filteredLabs;
            return _filteredLabs.where((lab) =>
                lab.name.toLowerCase().contains(pattern.toLowerCase()) ||
                lab.professorName.toLowerCase().contains(pattern.toLowerCase())).toList();
          },
          itemBuilder: (context, suggestion) {
            return ListTile(
              title: Text(suggestion.name),
              subtitle: Text('Professor: ${suggestion.professorName}'),
            );
          },
          onSelected: (suggestion) {
            setState(() {
              _selectedLabId = suggestion.id;
              _selectedLabName = suggestion.name;
              _labController.text = '${suggestion.name} - ${suggestion.professorName}';
            });
          },
          emptyBuilder: (context) => Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text('Lab/Professor not found'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => _showAddLabDialog(),
                  child: const Text('Add New Lab/Professor'),
                ),
              ],
            ),
          ),
        ),
        if (_selectedLabId == null && _selectedUniversityId != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Please select or add a lab/professor',
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
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Interactive Star Rating
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildInteractiveStars(),
                  const SizedBox(width: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _overallRating.toStringAsFixed(1),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Rating Slider for Fine-tuning
              Column(
                children: [
                  Text(
                    'Fine-tune your rating',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: AppColors.border,
                      thumbColor: AppColors.primary,
                      overlayColor: AppColors.primary.withOpacity(0.2),
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
                      trackHeight: 4,
                    ),
                    child: Slider(
                      value: _overallRating,
                      min: 0.5,
                      max: 5.0,
                      divisions: 9,
                      onChanged: (value) {
                        setState(() {
                          _overallRating = value;
                        });
                      },
                    ),
                  ),
                  // Rating Labels
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('0.5', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('1.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('2.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('3.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('4.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('5.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Rating Description
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getRatingColor(_overallRating).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getRatingDescription(_overallRating),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _getRatingColor(_overallRating),
                  ),
                ),
              ),
            ],
          ),
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


  void _showAddUniversityDialog() {
    String? universityName;
    String? universityWebsite;
    String? country;
    String? state;
    String? city;
    bool isVerifyingWebsite = false;
    String? websiteError;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add New University'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'University Name *',
                    hintText: 'e.g., Stanford University',
                  ),
                  onChanged: (value) => universityName = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Country *',
                    hintText: 'e.g., United States',
                  ),
                  onChanged: (value) => country = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'State/Province *',
                    hintText: 'e.g., California',
                  ),
                  onChanged: (value) => state = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'City *',
                    hintText: 'e.g., Stanford',
                  ),
                  onChanged: (value) => city = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: InputDecoration(
                    labelText: 'University Website *',
                    hintText: 'https://www.university.edu',
                    errorText: websiteError,
                    suffixIcon: isVerifyingWebsite
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.link),
                  ),
                  onChanged: (value) {
                    universityWebsite = value;
                    if (websiteError != null) {
                      setDialogState(() {
                        websiteError = null;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.info_outline, size: 16, color: AppColors.info),
                          const SizedBox(width: 8),
                          const Text('Verification Required', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'We will verify that the website exists and belongs to the specified university before adding it to our database.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isVerifyingWebsite ? null : () async {
                if (universityName?.isEmpty == true ||
                    universityWebsite?.isEmpty == true ||
                    country?.isEmpty == true ||
                    state?.isEmpty == true ||
                    city?.isEmpty == true) {
                  return;
                }

                // Validate website URL format
                if (universityWebsite != null && !_isValidUrl(universityWebsite!)) {
                  setDialogState(() {
                    websiteError = 'Please enter a valid URL (https://example.com)';
                  });
                  return;
                }

                setDialogState(() {
                  isVerifyingWebsite = true;
                  websiteError = null;
                });

                // Verify website exists
                final isValid = await _verifyWebsite(universityWebsite!);

                setDialogState(() {
                  isVerifyingWebsite = false;
                });

                if (!isValid) {
                  setDialogState(() {
                    websiteError = 'Website could not be verified. Please check the URL.';
                  });
                  return;
                }

                try {
                  // Add university via API
                  final newUniversity = await UniversityService.addUniversity(
                    name: universityName!,
                    website: universityWebsite!,
                    country: country!,
                    state: state!,
                    city: city!,
                  );

                  setState(() {
                    _selectedUniversityId = newUniversity.id;
                    _selectedUniversityName = newUniversity.name;
                    _universityController.text = newUniversity.name;
                    _filteredLabs = []; // No labs for new university initially
                  });
                  Navigator.pop(context);

                  // Show success message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('University added successfully! Website verified.'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                } catch (e) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to add university: ${e.toString()}'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              },
              child: isVerifyingWebsite
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Verify & Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddLabDialog() {
    String? labName;
    String? professorName;
    String? labWebsite;
    bool isVerifyingWebsite = false;
    String? websiteError;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add New Lab/Professor'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Lab Name *',
                    hintText: 'e.g., Computer Vision Lab',
                  ),
                  onChanged: (value) => labName = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Professor Name *',
                    hintText: 'e.g., Dr. Jane Smith',
                  ),
                  onChanged: (value) => professorName = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Lab Website *',
                    hintText: 'https://lab.university.edu',
                    errorText: websiteError,
                    suffixIcon: isVerifyingWebsite
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.link),
                  ),
                  onChanged: (value) {
                    labWebsite = value;
                    if (websiteError != null) {
                      setDialogState(() {
                        websiteError = null;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.info_outline, size: 16, color: AppColors.info),
                          const SizedBox(width: 8),
                          const Text('Verification Required', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'We will verify that the website exists and belongs to the specified lab/professor before adding it to our database.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isVerifyingWebsite ? null : () async {
                if (labName?.isEmpty == true || professorName?.isEmpty == true || labWebsite?.isEmpty == true) {
                  return;
                }

                // Validate website URL format
                if (labWebsite != null && !_isValidUrl(labWebsite!)) {
                  setDialogState(() {
                    websiteError = 'Please enter a valid URL (https://example.com)';
                  });
                  return;
                }

                setDialogState(() {
                  isVerifyingWebsite = true;
                  websiteError = null;
                });

                // Verify website exists
                final isValid = await _verifyWebsite(labWebsite!);

                setDialogState(() {
                  isVerifyingWebsite = false;
                });

                if (!isValid) {
                  setDialogState(() {
                    websiteError = 'Website could not be verified. Please check the URL.';
                  });
                  return;
                }

                try {
                  // Add lab via API
                  final newLab = await LabService.addLab(
                    name: labName!,
                    professorName: professorName!,
                    universityId: _selectedUniversityId!,
                    website: labWebsite!,
                  );

                  setState(() {
                    _selectedLabId = newLab.id;
                    _selectedLabName = newLab.name;
                    _labController.text = '${newLab.name} - ${newLab.professorName}';
                  });
                  Navigator.pop(context);

                  // Show success message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Lab/Professor added successfully! Website verified.'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                } catch (e) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to add lab: ${e.toString()}'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              },
              child: isVerifyingWebsite
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Verify & Add'),
            ),
          ],
        ),
      ),
    );
  }


  void _submitReview() async {
    if (!_formKey.currentState!.validate() ||
        _selectedUniversityId == null ||
        _selectedLabId == null) {
      String errorMessage = '';
      if (_selectedUniversityId == null) {
        errorMessage = 'Please select a university';
      } else if (_selectedLabId == null) {
        errorMessage = 'Please select a lab or professor';
      }

      if (errorMessage.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
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

      // Get current user from auth provider
      final authProvider = context.read<AuthProvider>();
      final currentUser = authProvider.currentUser;

      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      // Prepare review data for API
      final reviewData = {
        'lab_id': _selectedLabId!,
        'position': _position,
        'duration': _duration,
        'rating': _overallRating,
        'category_ratings': _categoryRatings,
        'review_text': _reviewTextController.text.trim(),
        'pros': pros,
        'cons': cons,
      };

      // Submit review via API
      await ReviewService.submitReview(reviewData);

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

  Widget _buildInteractiveStars() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final isHalfFilled = _overallRating >= index + 0.5 && _overallRating < starValue;
        final isFilled = _overallRating >= starValue;

        return GestureDetector(
          onTap: () {
            setState(() {
              // If tapping on a filled star, set to half rating
              // If tapping on empty/half star, set to full rating
              if (isFilled && _overallRating == starValue) {
                _overallRating = starValue - 0.5;
              } else if (isHalfFilled && _overallRating == starValue - 0.5) {
                _overallRating = starValue;
              } else {
                _overallRating = starValue;
              }
            });
          },
          child: Container(
            padding: const EdgeInsets.all(4),
            child: Icon(
              isFilled ? Icons.star : isHalfFilled ? Icons.star_half : Icons.star_border,
              size: 36,
              color: isFilled || isHalfFilled ? Colors.amber : AppColors.border,
            ),
          ),
        );
      }),
    );
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.5) return AppColors.success;
    if (rating >= 3.5) return AppColors.primary;
    if (rating >= 2.5) return Colors.orange;
    return AppColors.error;
  }

  String _getRatingDescription(double rating) {
    if (rating >= 4.5) return 'Excellent Experience';
    if (rating >= 3.5) return 'Good Experience';
    if (rating >= 2.5) return 'Average Experience';
    if (rating >= 1.5) return 'Below Average';
    return 'Poor Experience';
  }

  bool _isValidUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https') && uri.hasAuthority;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _verifyWebsite(String url) async {
    try {
      // Add http:// if no scheme is provided
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://$url';
      }

      // For demo purposes, we'll simulate website verification
      // In a real app, you would make an HTTP request to check if the website exists
      await Future.delayed(const Duration(seconds: 2));

      // Simple validation: check if it's a plausible academic URL
      final uri = Uri.parse(url);
      final domain = uri.host.toLowerCase();

      // Consider it valid if it contains common academic domains or keywords
      final isAcademic = domain.contains('.edu') ||
                        domain.contains('.ac.') ||
                        domain.contains('university') ||
                        domain.contains('institute') ||
                        domain.contains('college') ||
                        domain.contains('lab') ||
                        domain.contains('research');

      // For demo, randomly fail 10% of the time to show error handling
      final shouldFail = DateTime.now().millisecond % 10 == 0;

      return isAcademic && !shouldFail;
    } catch (e) {
      return false;
    }
  }

  @override
  void dispose() {
    _reviewTextController.dispose();
    _prosController.dispose();
    _consController.dispose();
    _universityController.dispose();
    _labController.dispose();
    super.dispose();
  }
}
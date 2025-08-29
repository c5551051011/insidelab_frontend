// presentation/screens/write_review/write_review_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../widgets/rating_stars.dart';

class WriteReviewScreen extends StatefulWidget {
  final Lab lab;

  const WriteReviewScreen({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reviewController = TextEditingController();
  final _prosController = TextEditingController();
  final _consController = TextEditingController();

  String _position = 'PhD Student';
  String _duration = '< 1 year';
  double _overallRating = 0;
  final Map<String, double> _categoryRatings = {
    'Research Environment': 0,
    'Advisor Support': 0,
    'Work-Life Balance': 0,
    'Career Development': 0,
    'Funding Availability': 0,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Write a Review'),
        actions: [
          TextButton(
            onPressed: _submitReview,
            child: const Text('Submit'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabInfo(),
              const SizedBox(height: 32),
              _buildBasicInfo(),
              const SizedBox(height: 32),
              _buildOverallRating(),
              const SizedBox(height: 32),
              _buildCategoryRatings(),
              const SizedBox(height: 32),
              _buildReviewText(),
              const SizedBox(height: 32),
              _buildProsCons(),
              const SizedBox(height: 32),
              _buildSubmitButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: AppColors.primaryLight.withOpacity(0.2),
              child: Text(
                widget.lab.name.substring(0, 2).toUpperCase(),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lab.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${widget.lab.professorName} • ${widget.lab.universityName}',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Basic Information',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Your Position',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _position,
                    items: const [
                      DropdownMenuItem(value: 'PhD Student', child: Text('PhD Student')),
                      DropdownMenuItem(value: 'MS Student', child: Text('MS Student')),
                      DropdownMenuItem(value: 'Undergrad', child: Text('Undergraduate')),
                      DropdownMenuItem(value: 'PostDoc', child: Text('PostDoc')),
                      DropdownMenuItem(value: 'Research Staff', child: Text('Research Staff')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _position = value!;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Time in Lab',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _duration,
                    items: const [
                      DropdownMenuItem(value: '< 1 year', child: Text('Less than 1 year')),
                      DropdownMenuItem(value: '1-2 years', child: Text('1-2 years')),
                      DropdownMenuItem(value: '2-3 years', child: Text('2-3 years')),
                      DropdownMenuItem(value: '3-4 years', child: Text('3-4 years')),
                      DropdownMenuItem(value: '4+ years', child: Text('4+ years')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _duration = value!;
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOverallRating() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Overall Rating',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Center(
          child: Column(
            children: [
              Text(
                _overallRating > 0 ? _overallRating.toStringAsFixed(1) : 'Tap to rate',
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    onPressed: () {
                      setState(() {
                        _overallRating = index + 1.0;
                      });
                    },
                    icon: Icon(
                      index < _overallRating ? Icons.star : Icons.star_border,
                      size: 40,
                      color: AppColors.rating,
                    ),
                  );
                }),
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
        const Text(
          'Category Ratings',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ..._categoryRatings.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.key,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Slider(
                        value: entry.value,
                        min: 0,
                        max: 5,
                        divisions: 10,
                        label: entry.value.toStringAsFixed(1),
                        onChanged: (value) {
                          setState(() {
                            _categoryRatings[entry.key] = value;
                          });
                        },
                      ),
                    ),
                    SizedBox(
                      width: 50,
                      child: Text(
                        entry.value.toStringAsFixed(1),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildReviewText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Review',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _reviewController,
          maxLines: 6,
          decoration: const InputDecoration(
            hintText: 'Share your experience in this lab...',
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please write your review';
            }
            if (value.length < 50) {
              return 'Please write at least 50 characters';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildProsCons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Pros & Cons',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _prosController,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Pros',
            hintText: 'What did you like? (one per line)',
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _consController,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Cons',
            hintText: 'What could be improved? (one per line)',
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Center(
      child: ElevatedButton(
        onPressed: _submitReview,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
          backgroundColor: AppColors.success,
        ),
        child: const Text(
          'Submit Review',
          style: TextStyle(fontSize: 16),
        ),
      ),
    );
  }

  void _submitReview() {
    if (_formKey.currentState!.validate() && _overallRating > 0) {
      // TODO: Implement review submission
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Review submitted successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pop(context);
    } else if (_overallRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please provide an overall rating'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void dispose() {
    _reviewController.dispose();
    _prosController.dispose();
    _consController.dispose();
    super.dispose();
  }
}
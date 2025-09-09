// presentation/screens/reviews/widgets/review_filters.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class ReviewFilters extends StatefulWidget {
  final Map<String, dynamic> filters;
  final Function(Map<String, dynamic>) onFiltersChanged;

  const ReviewFilters({
    Key? key,
    required this.filters,
    required this.onFiltersChanged,
  }) : super(key: key);

  @override
  State<ReviewFilters> createState() => _ReviewFiltersState();
}

class _ReviewFiltersState extends State<ReviewFilters> {
  late Map<String, dynamic> _currentFilters;

  @override
  void initState() {
    super.initState();
    _currentFilters = Map.from(widget.filters);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 1200),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filters',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              if (_currentFilters.isNotEmpty)
                TextButton(
                  onPressed: _clearFilters,
                  child: const Text('Clear All'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              _buildPositionFilter(),
              _buildRatingFilter(),
              _buildVerificationFilter(),
              _buildDateFilter(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPositionFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Position',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String?>(
            value: _currentFilters['position'],
            hint: const Text('All Positions'),
            underline: const SizedBox(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            items: [
              const DropdownMenuItem<String?>(
                value: null,
                child: Text('All Positions'),
              ),
              const DropdownMenuItem(
                value: 'PhD Student',
                child: Text('PhD Student'),
              ),
              const DropdownMenuItem(
                value: 'MS Student',
                child: Text('MS Student'),
              ),
              const DropdownMenuItem(
                value: 'Undergrad',
                child: Text('Undergrad'),
              ),
              const DropdownMenuItem(
                value: 'PostDoc',
                child: Text('PostDoc'),
              ),
              const DropdownMenuItem(
                value: 'Research Assistant',
                child: Text('Research Assistant'),
              ),
            ],
            onChanged: (value) {
              setState(() {
                if (value == null) {
                  _currentFilters.remove('position');
                } else {
                  _currentFilters['position'] = value;
                }
              });
              widget.onFiltersChanged(_currentFilters);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRatingFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Minimum Rating',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<double?>(
            value: _currentFilters['minRating'],
            hint: const Text('Any Rating'),
            underline: const SizedBox(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            items: [
              const DropdownMenuItem<double?>(
                value: null,
                child: Text('Any Rating'),
              ),
              const DropdownMenuItem(
                value: 2.0,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Text(' 2.0+'),
                  ],
                ),
              ),
              const DropdownMenuItem(
                value: 3.0,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Text(' 3.0+'),
                  ],
                ),
              ),
              const DropdownMenuItem(
                value: 4.0,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Text(' 4.0+'),
                  ],
                ),
              ),
              const DropdownMenuItem(
                value: 4.5,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Text(' 4.5+'),
                  ],
                ),
              ),
            ],
            onChanged: (value) {
              setState(() {
                if (value == null) {
                  _currentFilters.remove('minRating');
                } else {
                  _currentFilters['minRating'] = value;
                }
              });
              widget.onFiltersChanged(_currentFilters);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildVerificationFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Verification',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Checkbox(
              value: _currentFilters['verified'] == true,
              onChanged: (value) {
                setState(() {
                  if (value == true) {
                    _currentFilters['verified'] = true;
                  } else {
                    _currentFilters.remove('verified');
                  }
                });
                widget.onFiltersChanged(_currentFilters);
              },
              activeColor: AppColors.primary,
            ),
            Text(
              'Verified only',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDateFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Time Period',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButton<String?>(
            value: _currentFilters['timePeriod'],
            hint: const Text('All Time'),
            underline: const SizedBox(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            items: [
              const DropdownMenuItem<String?>(
                value: null,
                child: Text('All Time'),
              ),
              const DropdownMenuItem(
                value: '7days',
                child: Text('Last 7 days'),
              ),
              const DropdownMenuItem(
                value: '30days',
                child: Text('Last 30 days'),
              ),
              const DropdownMenuItem(
                value: '6months',
                child: Text('Last 6 months'),
              ),
              const DropdownMenuItem(
                value: '1year',
                child: Text('Last year'),
              ),
            ],
            onChanged: (value) {
              setState(() {
                if (value == null) {
                  _currentFilters.remove('timePeriod');
                } else {
                  _currentFilters['timePeriod'] = value;
                }
              });
              widget.onFiltersChanged(_currentFilters);
            },
          ),
        ),
      ],
    );
  }

  void _clearFilters() {
    setState(() {
      _currentFilters.clear();
    });
    widget.onFiltersChanged(_currentFilters);
  }
}

// presentation/screens/search/widgets/filter_sidebar.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FilterSidebar extends StatefulWidget {
  final Function(Map<String, dynamic>) onFiltersChanged;

  const FilterSidebar({
    Key? key,
    required this.onFiltersChanged,
  }) : super(key: key);

  @override
  State<FilterSidebar> createState() => _FilterSidebarState();
}

class _FilterSidebarState extends State<FilterSidebar> {
  double _minRating = 0;
  final Set<String> _selectedUniversities = {};
  final Set<String> _selectedResearchAreas = {};
  final Set<String> _selectedTags = {};

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Filters',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            _buildRatingFilter(),
            const SizedBox(height: 24),
            _buildUniversityFilter(),
            const SizedBox(height: 24),
            _buildResearchAreaFilter(),
            const SizedBox(height: 24),
            _buildTagFilter(),
            const SizedBox(height: 32),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Minimum Rating',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: _minRating,
                min: 0,
                max: 5,
                divisions: 10,
                label: _minRating.toStringAsFixed(1),
                onChanged: (value) {
                  setState(() {
                    _minRating = value;
                  });
                },
                onChangeEnd: (value) {
                  _applyFilters(); // Apply filters when user finishes sliding
                },
              ),
            ),
            Text(
              '${_minRating.toStringAsFixed(1)}+',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildUniversityFilter() {
    final universities = [
      'MIT',
      'Stanford',
      'Carnegie Mellon',
      'UC Berkeley',
      'Harvard',
      'Princeton',
      'Cornell',
      'Georgia Tech',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'University',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: universities.map((uni) {
            return FilterChip(
              label: Text(uni),
              selected: _selectedUniversities.contains(uni),
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedUniversities.add(uni);
                  } else {
                    _selectedUniversities.remove(uni);
                  }
                });
                _applyFilters(); // Apply filters immediately
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildResearchAreaFilter() {
    final areas = [
      'Machine Learning',
      'Computer Vision',
      'NLP',
      'Robotics',
      'AI Theory',
      'Deep Learning',
      'Reinforcement Learning',
      'AI Safety',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Research Area',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: areas.map((area) {
            return FilterChip(
              label: Text(area),
              selected: _selectedResearchAreas.contains(area),
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedResearchAreas.add(area);
                  } else {
                    _selectedResearchAreas.remove(area);
                  }
                });
                _applyFilters(); // Apply filters immediately
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTagFilter() {
    final tags = [
      'Well Funded',
      'International Friendly',
      'Industry Connections',
      'Flexible Hours',
      'Small Team',
      'Large Lab',
      'Publication Heavy',
      'Collaborative',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tags',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Column(
          children: tags.map((tag) {
            return CheckboxListTile(
              title: Text(tag),
              value: _selectedTags.contains(tag),
              onChanged: (selected) {
                setState(() {
                  if (selected == true) {
                    _selectedTags.add(tag);
                  } else {
                    _selectedTags.remove(tag);
                  }
                });
                _applyFilters(); // Apply filters immediately
              },
              controlAffinity: ListTileControlAffinity.leading,
              dense: true,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: _clearFilters,
            child: const Text('Clear All'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: ElevatedButton(
            onPressed: _applyFilters,
            child: const Text('Apply'),
          ),
        ),
      ],
    );
  }

  void _clearFilters() {
    setState(() {
      _minRating = 0;
      _selectedUniversities.clear();
      _selectedResearchAreas.clear();
      _selectedTags.clear();
    });
    _applyFilters();
  }

  void _applyFilters() {
    widget.onFiltersChanged({
      'minRating': _minRating,
      'universities': _selectedUniversities.toList(),
      'researchAreas': _selectedResearchAreas.toList(),
      'tags': _selectedTags.toList(),
    });
  }
}
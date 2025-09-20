
// presentation/screens/search/widgets/filter_sidebar.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/university.dart';
import '../../../../services/university_service.dart';

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
  final Set<String> _selectedUniversityIds = {};
  final Set<String> _selectedResearchAreas = {};
  final Set<String> _selectedTags = {};
  List<University> _universities = [];
  bool _universitiesLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUniversities();
  }

  Future<void> _loadUniversities() async {
    try {
      final universities = await UniversityService.getAllUniversities();
      setState(() {
        _universities = universities;
        _universitiesLoading = false;
      });
    } catch (e) {
      print('Error loading universities: $e');
      setState(() {
        _universitiesLoading = false;
      });
    }
  }

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
                  // Note: Rating filter will be applied when Apply button is clicked
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
        if (_universitiesLoading)
          const Center(child: CircularProgressIndicator())
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _universities.map((university) {
              return FilterChip(
                label: Text(university.name),
                selected: _selectedUniversityIds.contains(university.id),
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _selectedUniversityIds.add(university.id);
                    } else {
                      _selectedUniversityIds.remove(university.id);
                    }
                  });
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
      _selectedUniversityIds.clear();
      _selectedResearchAreas.clear();
      _selectedTags.clear();
    });
    _applyFilters();
  }

  void _applyFilters() {
    widget.onFiltersChanged({
      'minRating': _minRating,
      'universities': _selectedUniversityIds.toList(),
      'researchAreas': _selectedResearchAreas.toList(),
      'tags': _selectedTags.toList(),
    });
  }
}
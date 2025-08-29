// presentation/screens/search/search_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../widgets/lab_card.dart';
import 'widgets/filter_sidebar.dart';

class SearchScreen extends StatefulWidget {
  final String? initialQuery;

  const SearchScreen({
    Key? key,
    this.initialQuery,
  }) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late TextEditingController _searchController;
  Map<String, dynamic> _filters = {};

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: _buildSearchBar(),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 1000) {
            return Row(
              children: [
                SizedBox(
                  width: 300,
                  child: FilterSidebar(
                    onFiltersChanged: (filters) {
                      setState(() {
                        _filters = filters;
                      });
                    },
                  ),
                ),
                Expanded(
                  child: _buildResults(),
                ),
              ],
            );
          } else {
            return _buildResults();
          }
        },
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const SizedBox(width: 16),
          const Icon(Icons.search, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Search labs, professors, universities...',
                border: InputBorder.none,
              ),
              onSubmitted: (_) => _performSearch(),
            ),
          ),
          IconButton(
            onPressed: _performSearch,
            icon: const Icon(Icons.search),
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    // TODO: Replace with actual search results
    final results = _getMockSearchResults();

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${results.length} labs found for "${_searchController.text}"',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _buildSortOptions(),
          const SizedBox(height: 24),
          Expanded(
            child: ListView.builder(
              itemCount: results.length,
              itemBuilder: (context, index) {
                return LabCard(
                  lab: results[index],
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      '/lab-detail',
                      arguments: results[index],
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSortOptions() {
    return Row(
      children: [
        const Text('Sort by:'),
        const SizedBox(width: 8),
        DropdownButton<String>(
          value: 'rating',
          items: const [
            DropdownMenuItem(value: 'rating', child: Text('Rating')),
            DropdownMenuItem(value: 'reviews', child: Text('Reviews')),
            DropdownMenuItem(value: 'name', child: Text('Name')),
          ],
          onChanged: (value) {
            // TODO: Implement sorting
          },
        ),
      ],
    );
  }

  void _performSearch() {
    // TODO: Implement actual search
    setState(() {});
  }

  List<Lab> _getMockSearchResults() {
    return [
      Lab(
        id: '4',
        name: 'Berkeley AI Research Lab',
        professorName: 'Dr. Pieter Abbeel',
        professorId: 'prof4',
        universityName: 'UC Berkeley',
        universityId: 'uni4',
        department: 'EECS',
        overallRating: 4.8,
        reviewCount: 142,
        researchAreas: ['Robotics', 'Reinforcement Learning', 'Deep Learning'],
        tags: ['Startup Culture', 'Well Funded', 'Industry Focus'],
      ),
      Lab(
        id: '5',
        name: 'NYU CILVR Lab',
        professorName: 'Dr. Yann LeCun',
        professorId: 'prof5',
        universityName: 'New York University',
        universityId: 'uni5',
        department: 'Computer Science',
        overallRating: 4.7,
        reviewCount: 87,
        researchAreas: ['Computer Vision', 'Deep Learning', 'AI Theory'],
        tags: ['Research Heavy', 'International Friendly', 'Publication Focus'],
      ),
      Lab(
        id: '6',
        name: 'Toronto Machine Learning Group',
        professorName: 'Dr. Geoffrey Hinton',
        professorId: 'prof6',
        universityName: 'University of Toronto',
        universityId: 'uni6',
        department: 'Computer Science',
        overallRating: 4.9,
        reviewCount: 234,
        researchAreas: ['Deep Learning', 'Neural Networks', 'AI Safety'],
        tags: ['Top Tier', 'Innovation Focused', 'Collaborative'],
      ),
    ];
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

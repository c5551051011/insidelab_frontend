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
        id: '1',
        name: 'Stanford AI Lab (SAIL)',
        professorName: 'Dr. Fei-Fei Li',
        professorId: 'prof1',
        universityName: 'Stanford University',
        universityId: 'uni1',
        department: 'Computer Science',
        overallRating: 4.6,
        reviewCount: 128,
        researchAreas: ['Computer Vision', 'AI Safety', 'Deep Learning'],
        tags: ['Well Funded', 'Industry Focus', 'Publication Heavy'],
        description: 'Leading AI research lab focusing on computer vision and AI safety with strong industry connections.',
        website: 'https://ai.stanford.edu/',
        labSize: 45,
        ratingBreakdown: {
          'Mentorship Quality': 4.5,
          'Research Environment': 4.8,
          'Work-Life Balance': 3.9,
          'Career Support': 4.7,
          'Funding & Resources': 4.9,
          'Collaboration Culture': 4.4,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: true,
          isRecruitingPostdoc: true,
          isRecruitingIntern: false,
          notes: 'Actively recruiting PhD students in computer vision and robotics',
          lastUpdated: DateTime.now().subtract(const Duration(days: 7)),
        ),
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
        description: 'Cutting-edge research in NLP and healthcare AI with focus on real-world impact.',
        website: 'https://www.csail.mit.edu/',
        labSize: 32,
        ratingBreakdown: {
          'Mentorship Quality': 4.8,
          'Research Environment': 4.9,
          'Work-Life Balance': 4.2,
          'Career Support': 4.6,
          'Funding & Resources': 4.8,
          'Collaboration Culture': 4.7,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: false,
          isRecruitingPostdoc: true,
          isRecruitingIntern: true,
          notes: 'No PhD openings this year, but accepting exceptional postdocs',
          lastUpdated: DateTime.now().subtract(const Duration(days: 3)),
        ),
      ),
      Lab(
        id: '3',
        name: 'Berkeley AI Research Lab (BAIR)',
        professorName: 'Dr. Pieter Abbeel',
        professorId: 'prof3',
        universityName: 'UC Berkeley',
        universityId: 'uni3',
        department: 'EECS',
        overallRating: 4.8,
        reviewCount: 142,
        researchAreas: ['Robotics', 'Reinforcement Learning', 'Deep Learning'],
        tags: ['Startup Culture', 'Well Funded', 'Industry Focus'],
        description: 'Premier robotics and RL lab with strong startup connections and industry impact.',
        website: 'https://bair.berkeley.edu/',
        labSize: 38,
        ratingBreakdown: {
          'Mentorship Quality': 4.6,
          'Research Environment': 4.9,
          'Work-Life Balance': 4.0,
          'Career Support': 4.8,
          'Funding & Resources': 4.7,
          'Collaboration Culture': 4.5,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: true,
          isRecruitingPostdoc: false,
          isRecruitingIntern: true,
          notes: 'Looking for PhD students with robotics background',
          lastUpdated: DateTime.now().subtract(const Duration(days: 14)),
        ),
      ),
      Lab(
        id: '4',
        name: 'Carnegie Mellon Robotics Institute',
        professorName: 'Dr. Katia Sycara',
        professorId: 'prof4',
        universityName: 'Carnegie Mellon University',
        universityId: 'uni4',
        department: 'Robotics',
        overallRating: 4.5,
        reviewCount: 94,
        researchAreas: ['Multi-Agent Systems', 'Human-Robot Interaction', 'AI Planning'],
        tags: ['Research Heavy', 'Government Funding', 'Interdisciplinary'],
        description: 'World-renowned robotics research with focus on multi-agent systems and human-robot interaction.',
        website: 'https://www.ri.cmu.edu/',
        labSize: 28,
        ratingBreakdown: {
          'Mentorship Quality': 4.3,
          'Research Environment': 4.8,
          'Work-Life Balance': 4.1,
          'Career Support': 4.2,
          'Funding & Resources': 4.6,
          'Collaboration Culture': 4.4,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: true,
          isRecruitingPostdoc: true,
          isRecruitingIntern: false,
          notes: 'Seeking students interested in human-robot collaboration',
          lastUpdated: DateTime.now().subtract(const Duration(days: 21)),
        ),
      ),
      Lab(
        id: '5',
        name: 'University of Toronto Vector Institute',
        professorName: 'Dr. Geoffrey Hinton',
        professorId: 'prof5',
        universityName: 'University of Toronto',
        universityId: 'uni5',
        department: 'Computer Science',
        overallRating: 4.9,
        reviewCount: 234,
        researchAreas: ['Deep Learning', 'Neural Networks', 'AI Safety'],
        tags: ['Legendary', 'Innovation Focused', 'Collaborative'],
        description: 'Home of deep learning pioneers with groundbreaking research in neural networks and AI safety.',
        website: 'https://vectorinstitute.ai/',
        labSize: 52,
        ratingBreakdown: {
          'Mentorship Quality': 4.9,
          'Research Environment': 5.0,
          'Work-Life Balance': 4.3,
          'Career Support': 4.8,
          'Funding & Resources': 4.9,
          'Collaboration Culture': 4.8,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: false,
          isRecruitingPostdoc: false,
          isRecruitingIntern: false,
          notes: 'Not currently recruiting - highly competitive lab',
          lastUpdated: DateTime.now().subtract(const Duration(days: 2)),
        ),
      ),
      Lab(
        id: '6',
        name: 'Google DeepMind (University Partnership)',
        professorName: 'Dr. Demis Hassabis',
        professorId: 'prof6',
        universityName: 'Multiple Universities',
        universityId: 'uni6',
        department: 'Computer Science / AI',
        overallRating: 4.4,
        reviewCount: 67,
        researchAreas: ['Reinforcement Learning', 'Game AI', 'General AI'],
        tags: ['Industry Leader', 'Cutting Edge', 'High Pressure'],
        description: 'Industrial research lab with university partnerships, pushing the boundaries of general AI.',
        website: 'https://deepmind.com/',
        labSize: 15,
        ratingBreakdown: {
          'Mentorship Quality': 4.0,
          'Research Environment': 4.9,
          'Work-Life Balance': 3.8,
          'Career Support': 4.7,
          'Funding & Resources': 5.0,
          'Collaboration Culture': 4.1,
        },
        recruitmentStatus: RecruitmentStatus(
          isRecruitingPhD: true,
          isRecruitingPostdoc: true,
          isRecruitingIntern: true,
          notes: 'Partnership program with select universities',
          lastUpdated: DateTime.now().subtract(const Duration(days: 5)),
        ),
      ),
    ];
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

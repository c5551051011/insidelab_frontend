
// presentation/screens/home/widgets/featured_labs_section.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../widgets/lab_card.dart';

class FeaturedLabsSection extends StatelessWidget {
  const FeaturedLabsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual data from repository
    final featuredLabs = _getMockFeaturedLabs();

    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          const Text(
            '🔥 Top Rated Labs',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 32),
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 1200) {
                return _buildGridView(featuredLabs, 3);
              } else if (constraints.maxWidth > 800) {
                return _buildGridView(featuredLabs, 2);
              } else {
                return _buildListView(featuredLabs);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(List<Lab> labs, int crossAxisCount) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 1.5,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: labs.length,
      itemBuilder: (context, index) {
        return LabCard(
          lab: labs[index],
          onTap: () {
            Navigator.pushNamed(
              context,
              '/lab-detail',
              arguments: labs[index],
            );
          },
        );
      },
    );
  }

  Widget _buildListView(List<Lab> labs) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: labs.length,
      itemBuilder: (context, index) {
        return LabCard(
          lab: labs[index],
          onTap: () {
            Navigator.pushNamed(
              context,
              '/lab-detail',
              arguments: labs[index],
            );
          },
        );
      },
    );
  }

  List<Lab> _getMockFeaturedLabs() {
    return [
      Lab(
        id: '1',
        name: 'Stanford AI Lab',
        professorName: 'Dr. Andrew Ng',
        professorId: 'prof1',
        universityName: 'Stanford University',
        universityId: 'uni1',
        department: 'Computer Science',
        overallRating: 4.8,
        reviewCount: 156,
        researchAreas: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
        tags: ['Well Funded', 'Industry Connections', 'Flexible Hours'],
        description: 'Leading AI research lab focused on deep learning and applications',
        ratingBreakdown: {
          'Research Environment': 4.8,
          'Advisor Support': 4.6,
          'Work-Life Balance': 4.2,
          'Career Development': 4.9,
          'Funding Availability': 4.7,
        },
      ),
      Lab(
        id: '2',
        name: 'CMU Machine Learning Department',
        professorName: 'Dr. Tom Mitchell',
        professorId: 'prof2',
        universityName: 'Carnegie Mellon University',
        universityId: 'uni2',
        department: 'Machine Learning',
        overallRating: 4.9,
        reviewCount: 203,
        researchAreas: ['ML Theory', 'Statistical Learning', 'AI Systems'],
        tags: ['Top Tier', 'Large Lab', 'Publication Heavy'],
        description: 'World-renowned ML department with diverse research areas',
      ),
      Lab(
        id: '3',
        name: 'MIT CSAIL Vision Group',
        professorName: 'Dr. Antonio Torralba',
        professorId: 'prof3',
        universityName: 'MIT',
        universityId: 'uni3',
        department: 'EECS',
        overallRating: 4.7,
        reviewCount: 98,
        researchAreas: ['Computer Vision', '3D Vision', 'Scene Understanding'],
        tags: ['Collaborative', 'Innovation Focused', 'Small Team'],
        description: 'Cutting-edge computer vision research with industry impact',
      ),
    ];
  }
}
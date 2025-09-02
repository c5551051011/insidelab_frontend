
// presentation/screens/home/widgets/stats_section.dart
import 'package:flutter/material.dart';
import '../../../widgets/stat_card.dart';

class StatsSection extends StatelessWidget {
  const StatsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 24,
        runSpacing: 24,
        children: const [
          StatCard(
            number: '2,500+',
            label: 'Labs Reviewed',
            icon: Icons.science,
          ),
          StatCard(
            number: '150+',
            label: 'Universities',
            icon: Icons.school,
          ),
          StatCard(
            number: '10,000+',
            label: 'Student Reviews',
            icon: Icons.rate_review,
          ),
          StatCard(
            number: '50+',
            label: 'Research Areas',
            icon: Icons.category,
          ),
        ],
      ),
    );
  }
}
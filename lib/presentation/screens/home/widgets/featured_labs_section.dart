
// presentation/screens/home/widgets/featured_labs_section.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../../data/providers/data_providers.dart';
import '../../../widgets/lab_card.dart';
import '../../../widgets/common/loading_widget.dart';
import '../../../widgets/common/error_widget.dart';

class FeaturedLabsSection extends StatefulWidget {
  const FeaturedLabsSection({Key? key}) : super(key: key);

  @override
  State<FeaturedLabsSection> createState() => _FeaturedLabsSectionState();
}

class _FeaturedLabsSectionState extends State<FeaturedLabsSection> {
  @override
  void initState() {
    super.initState();
    // Load featured labs when widget initializes
    Future.microtask(() {
      context.read<LabProvider>().loadFeaturedLabs();
    });
  }

  @override
  Widget build(BuildContext context) {
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
          Consumer<LabProvider>(
            builder: (context, labProvider, child) {
              if (labProvider.isLoading && labProvider.featuredLabs == null) {
                return const LoadingWidget(
                  message: 'Loading featured labs...',
                );
              }

              if (labProvider.error != null) {
                return ErrorDisplayWidget(
                  message: labProvider.error!,
                  onRetry: () {
                    labProvider.loadFeaturedLabs();
                  },
                );
              }

              final labs = labProvider.featuredLabs ?? [];

              if (labs.isEmpty) {
                return const Center(
                  child: Text(
                    'No featured labs available',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                );
              }

              return LayoutBuilder(
                builder: (context, constraints) {
                  if (constraints.maxWidth > 1200) {
                    return _buildGridView(labs, 3);
                  } else if (constraints.maxWidth > 800) {
                    return _buildGridView(labs, 2);
                  } else {
                    return _buildListView(labs);
                  }
                },
              );
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
}

// presentation/screens/search/widgets/search_results_list.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../widgets/lab_card.dart';
import '../../../widgets/common/empty_state_widget.dart';
import '../../../widgets/common/loading_widget.dart';

class SearchResultsList extends StatelessWidget {
  final List<Lab>? results;
  final bool isLoading;
  final String searchQuery;
  final Function(Lab) onLabTap;
  final VoidCallback? onLoadMore;

  const SearchResultsList({
    Key? key,
    required this.results,
    required this.isLoading,
    required this.searchQuery,
    required this.onLabTap,
    this.onLoadMore,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isLoading && results == null) {
      return const LoadingWidget(
        message: 'Searching labs...',
      );
    }

    if (results == null || results!.isEmpty) {
      return EmptyStateWidget(
        icon: Icons.search_off,
        title: 'No labs found',
        subtitle: 'Try adjusting your search query or filters',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Results count
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              RichText(
                text: TextSpan(
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textPrimary,
                  ),
                  children: [
                    TextSpan(
                      text: '${results!.length}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const TextSpan(text: ' labs found for '),
                    TextSpan(
                      text: '"$searchQuery"',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              _buildSortDropdown(),
            ],
          ),
        ),

        // Results list
        Expanded(
          child: NotificationListener<ScrollNotification>(
            onNotification: (ScrollNotification scrollInfo) {
              if (!isLoading &&
                  scrollInfo.metrics.pixels ==
                      scrollInfo.metrics.maxScrollExtent &&
                  onLoadMore != null) {
                onLoadMore!();
              }
              return false;
            },
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              itemCount: results!.length + (isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == results!.length) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }

                final lab = results![index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: LabCard(
                    lab: lab,
                    onTap: () => onLabTap(lab),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSortDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: 'rating',
          icon: const Icon(Icons.arrow_drop_down, size: 20),
          isDense: true,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textPrimary,
          ),
          items: const [
            DropdownMenuItem(
              value: 'rating',
              child: Text('Highest Rated'),
            ),
            DropdownMenuItem(
              value: 'reviews',
              child: Text('Most Reviews'),
            ),
            DropdownMenuItem(
              value: 'name',
              child: Text('Alphabetical'),
            ),
            DropdownMenuItem(
              value: 'recent',
              child: Text('Recently Added'),
            ),
          ],
          onChanged: (String? value) {
            // TODO: Implement sorting
          },
        ),
      ),
    );
  }
}
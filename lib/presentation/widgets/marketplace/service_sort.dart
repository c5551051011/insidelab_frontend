// presentation/widgets/marketplace/service_sort.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class ServiceSort extends StatelessWidget {
  final String currentSort;
  final Function(String) onSortChanged;

  const ServiceSort({
    Key? key,
    required this.currentSort,
    required this.onSortChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      initialValue: currentSort,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.sort, color: AppColors.textSecondary, size: 20),
            const SizedBox(width: 8),
            Text(
              _getSortDisplayName(currentSort),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down,
              color: AppColors.textSecondary,
              size: 20,
            ),
          ],
        ),
      ),
      onSelected: onSortChanged,
      itemBuilder: (context) => [
        _buildSortMenuItem('relevance', 'Relevance', Icons.search),
        _buildSortMenuItem('price_low', 'Price: Low to High', Icons.arrow_upward),
        _buildSortMenuItem('price_high', 'Price: High to Low', Icons.arrow_downward),
        _buildSortMenuItem('rating', 'Highest Rated', Icons.star),
        _buildSortMenuItem('reviews', 'Most Reviews', Icons.rate_review),
        _buildSortMenuItem('response_time', 'Fastest Response', Icons.access_time),
        _buildSortMenuItem('newest', 'Newest First', Icons.fiber_new),
      ],
    );
  }

  PopupMenuItem<String> _buildSortMenuItem(String value, String label, IconData icon) {
    return PopupMenuItem<String>(
      value: value,
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Text(label),
          const Spacer(),
          if (value == currentSort)
            Icon(Icons.check, size: 16, color: AppColors.primary),
        ],
      ),
    );
  }

  String _getSortDisplayName(String sort) {
    switch (sort) {
      case 'relevance':
        return 'Relevance';
      case 'price_low':
        return 'Price ↑';
      case 'price_high':
        return 'Price ↓';
      case 'rating':
        return 'Rating';
      case 'reviews':
        return 'Reviews';
      case 'response_time':
        return 'Response';
      case 'newest':
        return 'Newest';
      default:
        return 'Sort';
    }
  }
}
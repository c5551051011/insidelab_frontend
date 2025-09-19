
// presentation/screens/home/widgets/search_bar_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../widgets/enhanced_search_bar.dart';

class SearchBarWidget extends StatelessWidget {
  const SearchBarWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final searchWidth = screenWidth > 600 ? 600.0 : screenWidth - 64;

    return Container(
      width: searchWidth,
      child: EnhancedSearchBar(
        onSearch: (query) => _performSearch(context, query),
        hintText: 'Search labs, professors, universities, research areas...',
        showSuggestions: true,
        showSearchIntent: false, // Disable to reduce clutter on homepage
      ),
    );
  }

  void _performSearch(BuildContext context, String query) {
    if (query.trim().isNotEmpty) {
      Navigator.pushNamed(
        context,
        '/search',
        arguments: query,
      );
    }
  }
}
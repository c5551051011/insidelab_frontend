// presentation/screens/home/widgets/search_bar_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class SearchBarWidget extends StatefulWidget {
  const SearchBarWidget({Key? key}) : super(key: key);

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  final _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final searchWidth = screenWidth > 600 ? 600.0 : screenWidth - 64;

    return Container(
      width: searchWidth,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: AppColors.elevatedShadow,
      ),
      child: Row(
        children: [
          const SizedBox(width: 16),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextField(
                controller: _searchController,
                decoration: const InputDecoration(
                  hintText: 'Search labs, professors, universities...',
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                ),
                onSubmitted: (_) => _performSearch(),
              ),
            ),
          ),
          Container(
            margin: const EdgeInsets.all(10),
            child: ElevatedButton(
              onPressed: _performSearch,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical:20),
              ),
              child: const Text('Search'),
            ),
          ),
        ],
      ),
    );
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      Navigator.pushNamed(context, '/search', arguments: query);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

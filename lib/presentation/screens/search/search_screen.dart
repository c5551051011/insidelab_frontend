// presentation/screens/search/search_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../services/search_service.dart';
import '../../widgets/lab_card.dart';
import '../../widgets/enhanced_search_bar.dart';
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
  String _currentQuery = '';
  Map<String, dynamic> _filters = {};
  List<Lab> _searchResults = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _sortBy = 'rating';
  int _currentPage = 1;
  bool _hasMoreResults = true;

  @override
  void initState() {
    super.initState();
    _currentQuery = widget.initialQuery ?? '';
    // Always perform search - if query is empty, it will show all labs
    _performSearch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Labs'),
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
                    onFiltersChanged: _onFiltersChanged,
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

  Widget _buildResults() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search bar with proper space for intent chips
          Container(
            padding: const EdgeInsets.only(bottom: 16),
            child: EnhancedSearchBar(
              initialQuery: _currentQuery,
              onSearch: _onSearchSubmitted,
              onQueryChanged: _onQueryChanged,
              showSearchIntent: true,
              showSuggestions: true,
            ),
          ),
          _buildResultsHeader(),
          const SizedBox(height: 8),
          _buildSortOptions(),
          const SizedBox(height: 24),
          Expanded(
            child: _buildResultsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsHeader() {
    if (_isLoading && _searchResults.isEmpty) {
      return const Row(
        children: [
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: 12),
          Text(
            'Searching...',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
    }

    if (_errorMessage != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.error_outline, color: Colors.red, size: 20),
              const SizedBox(width: 8),
              Text(
                'Search Error',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _errorMessage!,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ],
      );
    }

    final resultCount = _searchResults.length;
    final queryText = _currentQuery.isNotEmpty ? ' for "$_currentQuery"' : '';

    return Text(
      '$resultCount lab${resultCount != 1 ? 's' : ''} found$queryText',
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _buildResultsList() {
    if (_isLoading && _searchResults.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.textSecondary,
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _performSearch,
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    if (_searchResults.isEmpty && !_isLoading) {
      return _buildEmptyState();
    }

    return ListView.builder(
      itemCount: _searchResults.length + (_hasMoreResults ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _searchResults.length) {
          // Load more indicator
          return Container(
            padding: const EdgeInsets.all(16),
            child: Center(
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _loadMoreResults,
                      child: const Text('Load More'),
                    ),
            ),
          );
        }

        final lab = _searchResults[index];
        return LabCard(
          lab: lab,
          onTap: () {
            context.go('/lab/${lab.slug}');
          },
          highlightQuery: _currentQuery,
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 16),
          Text(
            'No labs found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _currentQuery.isNotEmpty
                ? 'Try adjusting your search terms or filters'
                : 'Enter a search term to find labs',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textSecondary,
            ),
          ),
          if (_currentQuery.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('Clear search'),
                  onPressed: () {
                    setState(() {
                      _currentQuery = '';
                      _searchResults.clear();
                    });
                  },
                ),
                ActionChip(
                  label: const Text('Clear filters'),
                  onPressed: () {
                    setState(() {
                      _filters.clear();
                    });
                    _performSearch();
                  },
                ),
              ],
            ),
          ],
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
          value: _sortBy,
          items: const [
            DropdownMenuItem(value: 'rating', child: Text('Rating')),
            DropdownMenuItem(value: 'reviews', child: Text('Reviews')),
            DropdownMenuItem(value: 'name', child: Text('Name')),
            DropdownMenuItem(value: 'newest', child: Text('Newest')),
          ],
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _sortBy = value;
              });
              _performSearch();
            }
          },
        ),
        const Spacer(),
        if (_isLoading && _searchResults.isNotEmpty)
          Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              const SizedBox(width: 8),
              Text(
                'Loading more...',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
      ],
    );
  }

  // Event handlers
  void _onSearchSubmitted(String query) {
    setState(() {
      _currentQuery = query.trim();
      _currentPage = 1;
      _hasMoreResults = true;
    });
    _performSearch();
  }

  void _onQueryChanged(String query) {
    // Optionally implement real-time search
    // For now, we'll only search on submit
  }

  void _onFiltersChanged(Map<String, dynamic> filters) {
    setState(() {
      _filters = filters;
      _currentPage = 1;
      _hasMoreResults = true;
    });
    _performSearch();
  }

  Future<void> _performSearch() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      if (_currentPage == 1) {
        _searchResults.clear();
      }
    });

    try {
      final results = await SearchService.searchLabs(
        query: _currentQuery,
        filters: _filters,
        page: _currentPage,
        limit: 20,
      );

      setState(() {
        if (_currentPage == 1) {
          _searchResults = results;
        } else {
          _searchResults.addAll(results);
        }
        _hasMoreResults = results.length >= 20;
        _applySorting();
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to search labs: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMoreResults() async {
    if (_isLoading || !_hasMoreResults) return;

    setState(() {
      _currentPage++;
    });

    await _performSearch();
  }

  void _applySorting() {
    switch (_sortBy) {
      case 'rating':
        _searchResults.sort((a, b) => b.overallRating.compareTo(a.overallRating));
        break;
      case 'reviews':
        _searchResults.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
        break;
      case 'name':
        _searchResults.sort((a, b) => a.name.compareTo(b.name));
        break;
      case 'newest':
        // Sort by a newest field if available, or keep current order
        break;
    }
  }


  @override
  void dispose() {
    super.dispose();
  }
}

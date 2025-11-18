// presentation/screens/search/search_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../data/providers/data_cache_provider.dart';
import '../../../data/providers/saved_labs_provider.dart';
import '../../../data/providers/search_state_provider.dart';
import '../../../services/search_service.dart';
import '../../widgets/lab_card.dart';
import '../../widgets/enhanced_search_bar.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/floating_feedback_button.dart';
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
  int _totalCount = 0;
  bool _isLoading = false;
  String? _errorMessage;
  String _sortBy = 'rating';
  int _currentPage = 1;
  bool _hasMoreResults = true;

  @override
  void initState() {
    super.initState();

    // Check if we have cached data first
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final cacheProvider = context.read<DataCacheProvider>();
      final savedLabsProvider = context.read<SavedLabsProvider>();
      final searchStateProvider = context.read<SearchStateProvider>();

      // Load saved lab IDs for proper save button states
      savedLabsProvider.loadSavedLabIds();

      // Restore search state if available, otherwise use initialQuery
      if (searchStateProvider.shouldRestoreState()) {
        final savedState = searchStateProvider.searchState;
        setState(() {
          _currentQuery = savedState.query;
          _filters = Map<String, dynamic>.from(savedState.filters);
          _searchResults = List<Lab>.from(savedState.results);
          _totalCount = savedState.totalCount;
          _sortBy = savedState.sortBy;
          _currentPage = savedState.currentPage;
          _hasMoreResults = savedState.hasMoreResults;
          _isLoading = false;
        });
        print('Restored search state: query="${_currentQuery}", filters=${searchStateProvider.getFiltersDescription()}');
      } else if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
        _currentQuery = widget.initialQuery!;
        _performSearch();
      } else if (_currentQuery.isEmpty && cacheProvider.hasPopularLabs) {
        // Use cached popular labs for initial display
        setState(() {
          _searchResults = cacheProvider.getInitialSearchResults();
          _totalCount = _searchResults.length;
          _isLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Stack(
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 1000) {
                return Row(
                  children: [
                    SizedBox(
                      width: 300,
                      child: FilterSidebar(
                        key: ValueKey(_filters.hashCode), // Force rebuild when filters change
                        onFiltersChanged: _onFiltersChanged,
                        initialFilters: _filters,
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
          const FloatingFeedbackButton(),
        ],
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

    final resultCount = _totalCount > 0 ? _totalCount : _searchResults.length;
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
                    final searchStateProvider = context.read<SearchStateProvider>();
                    searchStateProvider.clearSearch();
                    setState(() {
                      _currentQuery = '';
                      _searchResults.clear();
                      _totalCount = 0;
                      _currentPage = 1;
                      _hasMoreResults = true;
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
            DropdownMenuItem(value: 'lab', child: Text('Lab Name')),
            DropdownMenuItem(value: 'professor', child: Text('Professor')),
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
    // Clear search state and filters when starting a new search
    final searchStateProvider = context.read<SearchStateProvider>();
    searchStateProvider.clearSearch();

    setState(() {
      _currentQuery = query.trim();
      _filters.clear(); // Clear all filters for new search
      _currentPage = 1;
      _hasMoreResults = true;
      _searchResults.clear(); // Clear previous results
      _totalCount = 0;
      _errorMessage = null;
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
      final searchResult = await SearchService.searchLabsWithCount(
        query: _currentQuery,
        filters: _filters,
        sortBy: _sortBy,
        page: _currentPage,
        limit: 20,
      );

      setState(() {
        if (_currentPage == 1) {
          _searchResults = searchResult.labs;
          _totalCount = searchResult.totalCount;
        } else {
          _searchResults.addAll(searchResult.labs);
          // Keep the same total count for pagination
        }
        _hasMoreResults = searchResult.labs.length >= 20;
      });

      // Save search state to provider for restoration later
      if (mounted) {
        final searchStateProvider = context.read<SearchStateProvider>();
        searchStateProvider.updateSearchState(
          query: _currentQuery,
          filters: _filters,
          results: _searchResults,
          totalCount: _totalCount,
          sortBy: _sortBy,
          currentPage: _currentPage,
          hasMoreResults: _hasMoreResults,
        );
      }
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



  @override
  void dispose() {
    super.dispose();
  }
}

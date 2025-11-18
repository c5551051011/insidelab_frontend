// data/providers/search_state_provider.dart
import 'package:flutter/material.dart';
import '../models/lab.dart';

class SearchState {
  final String query;
  final Map<String, dynamic> filters;
  final List<Lab> results;
  final int totalCount;
  final String sortBy;
  final int currentPage;
  final bool hasMoreResults;

  const SearchState({
    this.query = '',
    this.filters = const {},
    this.results = const [],
    this.totalCount = 0,
    this.sortBy = 'rating',
    this.currentPage = 1,
    this.hasMoreResults = true,
  });

  SearchState copyWith({
    String? query,
    Map<String, dynamic>? filters,
    List<Lab>? results,
    int? totalCount,
    String? sortBy,
    int? currentPage,
    bool? hasMoreResults,
  }) {
    return SearchState(
      query: query ?? this.query,
      filters: filters ?? this.filters,
      results: results ?? this.results,
      totalCount: totalCount ?? this.totalCount,
      sortBy: sortBy ?? this.sortBy,
      currentPage: currentPage ?? this.currentPage,
      hasMoreResults: hasMoreResults ?? this.hasMoreResults,
    );
  }
}

class SearchStateProvider extends ChangeNotifier {
  SearchState _searchState = const SearchState();
  bool _isSearchActive = false;

  SearchState get searchState => _searchState;
  bool get isSearchActive => _isSearchActive;

  void updateSearchState({
    String? query,
    Map<String, dynamic>? filters,
    List<Lab>? results,
    int? totalCount,
    String? sortBy,
    int? currentPage,
    bool? hasMoreResults,
  }) {
    _searchState = _searchState.copyWith(
      query: query,
      filters: filters,
      results: results,
      totalCount: totalCount,
      sortBy: sortBy,
      currentPage: currentPage,
      hasMoreResults: hasMoreResults,
    );
    _isSearchActive = true;
    notifyListeners();
  }

  void updateQuery(String query) {
    _searchState = _searchState.copyWith(query: query);
    _isSearchActive = query.isNotEmpty || _searchState.filters.isNotEmpty;
    notifyListeners();
  }

  void updateFilters(Map<String, dynamic> filters) {
    _searchState = _searchState.copyWith(filters: Map<String, dynamic>.from(filters));
    _isSearchActive = _searchState.query.isNotEmpty || filters.isNotEmpty;
    notifyListeners();
  }

  void updateResults(List<Lab> results, int totalCount, {bool hasMoreResults = true}) {
    _searchState = _searchState.copyWith(
      results: results,
      totalCount: totalCount,
      hasMoreResults: hasMoreResults,
    );
    notifyListeners();
  }

  void updateSortBy(String sortBy) {
    _searchState = _searchState.copyWith(sortBy: sortBy);
    notifyListeners();
  }

  void updatePage(int page) {
    _searchState = _searchState.copyWith(currentPage: page);
    notifyListeners();
  }

  void clearSearch() {
    _searchState = const SearchState();
    _isSearchActive = false;
    notifyListeners();
  }

  // Helper method to check if we should restore state
  bool shouldRestoreState() {
    return _isSearchActive &&
           (_searchState.query.isNotEmpty || _searchState.filters.isNotEmpty);
  }

  // Helper method to get filters as a readable string for debugging
  String getFiltersDescription() {
    if (_searchState.filters.isEmpty) return 'No filters';

    List<String> filterDescriptions = [];
    _searchState.filters.forEach((key, value) {
      if (value != null && value.toString().isNotEmpty) {
        filterDescriptions.add('$key: $value');
      }
    });

    return filterDescriptions.isEmpty ? 'No active filters' : filterDescriptions.join(', ');
  }
}
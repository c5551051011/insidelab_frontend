// lib/presentation/widgets/enhanced_search_bar.dart
import 'package:flutter/material.dart';
import 'dart:async';
import '../../core/constants/app_colors.dart';
import '../../services/search_service.dart';

class EnhancedSearchBar extends StatefulWidget {
  final String? initialQuery;
  final Function(String)? onSearch;
  final Function(String)? onQueryChanged;
  final String? hintText;
  final bool showSuggestions;
  final bool showSearchIntent;

  const EnhancedSearchBar({
    Key? key,
    this.initialQuery,
    this.onSearch,
    this.onQueryChanged,
    this.hintText,
    this.showSuggestions = true,
    this.showSearchIntent = true,
  }) : super(key: key);

  @override
  State<EnhancedSearchBar> createState() => _EnhancedSearchBarState();
}

class _EnhancedSearchBarState extends State<EnhancedSearchBar> {
  late TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();
  List<String> _suggestions = [];
  bool _showSuggestions = false;
  Timer? _debounceTimer;
  SearchIntent? _detectedIntent;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
    _focusNode.addListener(_onFocusChanged);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: _focusNode.hasFocus ? AppColors.primary : AppColors.border,
              width: _focusNode.hasFocus ? 2 : 1,
            ),
            boxShadow: _focusNode.hasFocus
                ? [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            children: [
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      decoration: InputDecoration(
                        hintText: widget.hintText ?? _getContextualHintText(),
                        border: InputBorder.none,
                        hintStyle: TextStyle(
                          color: AppColors.textSecondary.withOpacity(0.7),
                          fontSize: 16,
                        ),
                      ),
                      style: const TextStyle(
                        fontSize: 16,
                        color: AppColors.textPrimary,
                      ),
                      onChanged: _onQueryChanged,
                      onSubmitted: _onSubmitted,
                    ),
                    if (widget.showSearchIntent && _detectedIntent != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _buildSearchIntentChip(),
                      ),
                  ],
                ),
              ),
              if (_controller.text.isNotEmpty)
                IconButton(
                  onPressed: _clearSearch,
                  icon: const Icon(Icons.clear),
                  color: AppColors.textSecondary,
                  iconSize: 20,
                ),
              IconButton(
                onPressed: () => _onSubmitted(_controller.text),
                icon: const Icon(Icons.search),
                color: AppColors.primary,
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
        if (_showSuggestions && _suggestions.isNotEmpty)
          _buildSuggestionsPanel(),
      ],
    );
  }

  Widget _buildSearchIntentChip() {
    String intentText = '';
    Color chipColor = AppColors.primary;
    IconData chipIcon = Icons.search;

    switch (_detectedIntent!) {
      case SearchIntent.university:
        intentText = 'Searching universities';
        chipColor = Colors.blue;
        chipIcon = Icons.school;
        break;
      case SearchIntent.professor:
        intentText = 'Searching professors';
        chipColor = Colors.green;
        chipIcon = Icons.person;
        break;
      case SearchIntent.researchArea:
        intentText = 'Searching research areas';
        chipColor = Colors.orange;
        chipIcon = Icons.science;
        break;
      case SearchIntent.labName:
        intentText = 'Searching labs';
        chipColor = Colors.purple;
        chipIcon = Icons.biotech;
        break;
      case SearchIntent.general:
        intentText = 'General search';
        chipColor = AppColors.primary;
        chipIcon = Icons.search;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: chipColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(chipIcon, size: 12, color: chipColor),
          const SizedBox(width: 4),
          Text(
            intentText,
            style: TextStyle(
              fontSize: 11,
              color: chipColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionsPanel() {
    return Container(
      margin: const EdgeInsets.only(top: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Icon(Icons.history, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(
                  'Suggestions',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _suggestions.length,
            itemBuilder: (context, index) {
              final suggestion = _suggestions[index];
              return InkWell(
                onTap: () => _selectSuggestion(suggestion),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Icon(
                        _getSuggestionIcon(suggestion),
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          suggestion,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                      Icon(
                        Icons.call_made,
                        size: 14,
                        color: AppColors.textSecondary.withOpacity(0.5),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          if (_suggestions.isEmpty && _controller.text.isNotEmpty)
            _buildPopularSearches(),
        ],
      ),
    );
  }

  Widget _buildPopularSearches() {
    final popularTerms = SearchService.getPopularSearchTerms();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: Text(
            'Popular searches',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: popularTerms.take(5).length,
          itemBuilder: (context, index) {
            final term = popularTerms[index];
            return InkWell(
              onTap: () => _selectSuggestion(term),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Icon(
                      Icons.trending_up,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        term,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  IconData _getSearchIcon() {
    if (_detectedIntent == null) return Icons.search;

    switch (_detectedIntent!) {
      case SearchIntent.university:
        return Icons.school;
      case SearchIntent.professor:
        return Icons.person;
      case SearchIntent.researchArea:
        return Icons.science;
      case SearchIntent.labName:
        return Icons.biotech;
      default:
        return Icons.search;
    }
  }

  IconData _getSuggestionIcon(String suggestion) {
    final intent = SearchService.analyzeSearchIntent(suggestion);
    switch (intent) {
      case SearchIntent.university:
        return Icons.school;
      case SearchIntent.professor:
        return Icons.person;
      case SearchIntent.researchArea:
        return Icons.science;
      case SearchIntent.labName:
        return Icons.biotech;
      default:
        return Icons.search;
    }
  }

  String _getContextualHintText() {
    if (_detectedIntent != null) {
      switch (_detectedIntent!) {
        case SearchIntent.university:
          return 'Search universities...';
        case SearchIntent.professor:
          return 'Search professors...';
        case SearchIntent.researchArea:
          return 'Search research areas...';
        case SearchIntent.labName:
          return 'Search labs...';
        default:
          return 'Search labs, professors, universities...';
      }
    }
    return 'Search labs, professors, universities, research areas...';
  }

  void _onQueryChanged(String query) {
    widget.onQueryChanged?.call(query);

    // Analyze search intent
    if (widget.showSearchIntent) {
      final newIntent = query.isNotEmpty
          ? SearchService.analyzeSearchIntent(query)
          : null;
      print('DEBUG: Query "$query" detected intent: $newIntent');
      setState(() {
        _detectedIntent = newIntent;
      });
    }

    // Debounce suggestions loading
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _loadSuggestions(query);
    });
  }

  void _onSubmitted(String query) {
    setState(() {
      _showSuggestions = false;
    });
    widget.onSearch?.call(query);
    _focusNode.unfocus();
  }

  void _selectSuggestion(String suggestion) {
    _controller.text = suggestion;
    _onSubmitted(suggestion);
  }

  void _clearSearch() {
    _controller.clear();
    setState(() {
      _suggestions.clear();
      _showSuggestions = false;
      _detectedIntent = null;
    });
    widget.onQueryChanged?.call('');
  }

  void _onFocusChanged() {
    if (_focusNode.hasFocus && widget.showSuggestions) {
      setState(() {
        _showSuggestions = true;
      });
      if (_controller.text.isNotEmpty) {
        _loadSuggestions(_controller.text);
      }
    } else {
      // Small delay to allow suggestion selection
      Timer(const Duration(milliseconds: 150), () {
        if (mounted) {
          setState(() {
            _showSuggestions = false;
          });
        }
      });
    }
  }

  String? _lastSuggestionQuery;

  Future<void> _loadSuggestions(String query) async {
    if (!widget.showSuggestions || query.trim().isEmpty) {
      setState(() {
        _suggestions.clear();
      });
      return;
    }

    // Avoid duplicate requests for the same query
    if (_lastSuggestionQuery == query.trim()) {
      return;
    }

    _lastSuggestionQuery = query.trim();

    try {
      final suggestions = await SearchService.getSearchSuggestions(query);
      if (mounted && _lastSuggestionQuery == query.trim()) {
        setState(() {
          _suggestions = suggestions;
        });
      }
    } catch (e) {
      print('Error loading suggestions: $e');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }
}
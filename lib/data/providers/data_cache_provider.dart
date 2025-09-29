// data/providers/data_cache_provider.dart
import 'dart:async';
import 'package:flutter/material.dart';
import '../models/lab.dart';
import '../models/university.dart';
import '../../services/lab_service.dart';
import '../../services/university_service.dart';
import '../../services/search_service.dart';

class DataCacheProvider extends ChangeNotifier {
  // Cache for frequently accessed data
  List<Lab>? _popularLabs;
  List<University>? _allUniversities;
  List<String>? _popularSearchTerms;
  List<Lab>? _recentLabs;

  // Loading states
  bool _isLoadingPopularLabs = false;
  bool _isLoadingUniversities = false;
  bool _isPreloading = false;

  // Cache timestamps
  DateTime? _popularLabsTimestamp;
  DateTime? _universitiesTimestamp;

  // Cache expiry duration
  static const Duration _cacheExpiry = Duration(hours: 1);
  static const Duration _universityCacheExpiry = Duration(hours: 6);

  // Getters
  List<Lab>? get popularLabs => _popularLabs;
  List<University>? get allUniversities => _allUniversities;
  List<String>? get popularSearchTerms => _popularSearchTerms;
  List<Lab>? get recentLabs => _recentLabs;

  bool get isLoadingPopularLabs => _isLoadingPopularLabs;
  bool get isLoadingUniversities => _isLoadingUniversities;
  bool get isPreloading => _isPreloading;

  bool get hasPopularLabs => _popularLabs != null && _popularLabs!.isNotEmpty;
  bool get hasUniversities => _allUniversities != null && _allUniversities!.isNotEmpty;

  // Check if cache is valid
  bool get isPopularLabsCacheValid {
    if (_popularLabsTimestamp == null) return false;
    return DateTime.now().difference(_popularLabsTimestamp!) < _cacheExpiry;
  }

  bool get isUniversitiesCacheValid {
    if (_universitiesTimestamp == null) return false;
    return DateTime.now().difference(_universitiesTimestamp!) < _universityCacheExpiry;
  }

  /// Preload essential data for better search performance
  Future<void> preloadEssentialData() async {
    if (_isPreloading) return;

    _isPreloading = true;
    notifyListeners();

    try {
      // Load data in parallel for better performance
      await Future.wait([
        _loadPopularLabsIfNeeded(),
        _loadUniversitiesIfNeeded(),
        _loadPopularSearchTerms(),
      ]);
    } catch (e) {
      print('Error preloading data: $e');
    } finally {
      _isPreloading = false;
      notifyListeners();
    }
  }

  /// Load popular/featured labs for quick access
  Future<void> _loadPopularLabsIfNeeded() async {
    if (isPopularLabsCacheValid && hasPopularLabs) return;

    _isLoadingPopularLabs = true;
    notifyListeners();

    try {
      // Load both featured labs and recent popular labs
      final futures = await Future.wait([
        LabService.getFeaturedLabs(),
        _loadRecentPopularLabs(),
      ]);

      final featuredLabs = futures[0] as List<Lab>;
      final recentLabs = futures[1] as List<Lab>;

      // Combine and deduplicate
      final allLabs = <String, Lab>{};

      // Add featured labs first (higher priority)
      for (final lab in featuredLabs) {
        allLabs[lab.id] = lab;
      }

      // Add recent popular labs
      for (final lab in recentLabs) {
        allLabs[lab.id] = lab;
      }

      _popularLabs = allLabs.values.take(20).toList();
      _recentLabs = recentLabs.take(10).toList();
      _popularLabsTimestamp = DateTime.now();

    } catch (e) {
      print('Error loading popular labs: $e');
      _popularLabs = [];
      _recentLabs = [];
    } finally {
      _isLoadingPopularLabs = false;
      notifyListeners();
    }
  }

  /// Load recent popular labs based on search patterns
  Future<List<Lab>> _loadRecentPopularLabs() async {
    try {
      // Load labs with high ratings and review counts
      final result = await LabService.searchLabsAdvancedWithCount(
        minRating: 4.0,
        ordering: '-review_count',
        limit: 15,
      );
      return result.labs;
    } catch (e) {
      print('Error loading recent popular labs: $e');
      return [];
    }
  }

  /// Load all universities for search filters
  Future<void> _loadUniversitiesIfNeeded() async {
    if (isUniversitiesCacheValid && hasUniversities) return;

    _isLoadingUniversities = true;
    notifyListeners();

    try {
      // Load universities in batches for better performance
      final universities = <University>[];
      int page = 1;
      const limit = 100;
      bool hasMore = true;

      while (hasMore && page <= 5) { // Limit to 5 pages (500 universities max)
        final batch = await UniversityService.getAllUniversities(
          page: page,
          limit: limit,
        );

        universities.addAll(batch);
        hasMore = batch.length == limit;
        page++;

        // Allow UI updates between batches
        if (page % 2 == 0) {
          _allUniversities = List.from(universities);
          notifyListeners();
        }
      }

      _allUniversities = universities;
      _universitiesTimestamp = DateTime.now();

    } catch (e) {
      print('Error loading universities: $e');
      _allUniversities = [];
    } finally {
      _isLoadingUniversities = false;
      notifyListeners();
    }
  }

  /// Load popular search terms
  Future<void> _loadPopularSearchTerms() async {
    try {
      _popularSearchTerms = SearchService.getPopularSearchTerms();
    } catch (e) {
      print('Error loading popular search terms: $e');
      _popularSearchTerms = [];
    }
  }

  /// Get labs that can be used as initial search results
  List<Lab> getInitialSearchResults({int limit = 20}) {
    if (!hasPopularLabs) return [];

    return _popularLabs!.take(limit).toList();
  }

  /// Get universities for filter dropdown
  List<University> getUniversitiesForFilter({String? query}) {
    if (!hasUniversities) return [];

    if (query == null || query.isEmpty) {
      return _allUniversities!.take(50).toList(); // Return top 50 for dropdown
    }

    // Filter by query
    final lowerQuery = query.toLowerCase();
    return _allUniversities!
        .where((uni) => uni.name.toLowerCase().contains(lowerQuery))
        .take(20)
        .toList();
  }

  /// Force refresh all cached data
  Future<void> refreshAllData() async {
    _popularLabs = null;
    _allUniversities = null;
    _popularSearchTerms = null;
    _recentLabs = null;
    _popularLabsTimestamp = null;
    _universitiesTimestamp = null;

    await preloadEssentialData();
  }

  /// Clear all cached data
  void clearCache() {
    _popularLabs = null;
    _allUniversities = null;
    _popularSearchTerms = null;
    _recentLabs = null;
    _popularLabsTimestamp = null;
    _universitiesTimestamp = null;

    notifyListeners();
  }

  /// Get cache statistics for debugging
  Map<String, dynamic> getCacheStats() {
    return {
      'popularLabs': {
        'count': _popularLabs?.length ?? 0,
        'cached': _popularLabsTimestamp?.toIso8601String(),
        'valid': isPopularLabsCacheValid,
      },
      'universities': {
        'count': _allUniversities?.length ?? 0,
        'cached': _universitiesTimestamp?.toIso8601String(),
        'valid': isUniversitiesCacheValid,
      },
      'searchTerms': {
        'count': _popularSearchTerms?.length ?? 0,
      },
      'recentLabs': {
        'count': _recentLabs?.length ?? 0,
      },
    };
  }
}
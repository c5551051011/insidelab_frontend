// lib/services/search_service.dart
import '../data/models/lab.dart';
import 'lab_service.dart';

class SearchService {
  // Cache for search suggestions to avoid duplicate API calls
  static final Map<String, List<String>> _suggestionCache = {};
  static final Map<String, DateTime> _cacheTimestamps = {};
  static const Duration _cacheExpiry = Duration(minutes: 5);

  /// Comprehensive search across multiple fields
  static Future<List<Lab>> searchLabs({
    required String query,
    Map<String, dynamic>? filters,
    String? sortBy,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      // If query is empty, just get labs with filters
      if (query.trim().isEmpty) {
        return await _getFilteredLabs(filters: filters, sortBy: sortBy, page: page, limit: limit);
      }

      // Prepare search parameters
      final searchParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      // Add query as a multi-field search
      searchParams['search'] = query.trim();

      // Apply filters if provided
      if (filters != null) {
        if (filters['minRating'] != null && filters['minRating'] > 0) {
          searchParams['min_rating'] = filters['minRating'];
        }

        if (filters['maxRating'] != null && filters['maxRating'] > 0) {
          searchParams['max_rating'] = filters['maxRating'];
        }

        if (filters['universities'] != null &&
            (filters['universities'] as List).isNotEmpty) {
          // Backend expects single university parameter, send first selected
          searchParams['university'] = (filters['universities'] as List).first;
        }

        if (filters['researchAreas'] != null &&
            (filters['researchAreas'] as List).isNotEmpty) {
          // Backend expects single research_area parameter, send first selected
          searchParams['research_area'] = (filters['researchAreas'] as List).first;
        }

        if (filters['tags'] != null &&
            (filters['tags'] as List).isNotEmpty) {
          // Backend expects single tag parameter, send first selected
          searchParams['tag'] = (filters['tags'] as List).first;
        }

        if (filters['department'] != null) {
          searchParams['department'] = filters['department'];
        }

        if (filters['professorId'] != null) {
          searchParams['professor'] = filters['professorId'];
        }

        if (filters['recruitingPhd'] != null) {
          searchParams['recruiting_phd'] = filters['recruitingPhd'];
        }

        if (filters['recruitingPostdoc'] != null) {
          searchParams['recruiting_postdoc'] = filters['recruitingPostdoc'];
        }

        if (filters['recruitingIntern'] != null) {
          searchParams['recruiting_intern'] = filters['recruitingIntern'];
        }
      }

      // Convert UI sort option to backend ordering parameter
      final ordering = _convertSortToOrdering(sortBy);

      // Use the advanced search method from LabService
      return await LabService.searchLabsAdvanced(
        query: searchParams['search'],
        university: searchParams['university'],
        professor: searchParams['professor'],
        department: searchParams['department'],
        researchArea: searchParams['research_area'],
        tag: searchParams['tag'],
        minRating: searchParams['min_rating'],
        maxRating: searchParams['max_rating'],
        recruitingPhd: searchParams['recruiting_phd'],
        recruitingPostdoc: searchParams['recruiting_postdoc'],
        recruitingIntern: searchParams['recruiting_intern'],
        ordering: ordering,
        page: page,
        limit: limit,
      );
    } catch (e) {
      return [];
    }
  }

  /// Get labs with only filters (no text query)
  static Future<List<Lab>> _getFilteredLabs({
    Map<String, dynamic>? filters,
    String? sortBy,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      return await LabService.searchLabsAdvanced(
        university: filters?['universities']?.isNotEmpty == true ? filters!['universities'].first : null,
        professor: filters?['professorId'],
        department: filters?['department'],
        researchArea: filters?['researchAreas']?.isNotEmpty == true ? filters!['researchAreas'].first : null,
        tag: filters?['tags']?.isNotEmpty == true ? filters!['tags'].first : null,
        minRating: filters?['minRating'],
        maxRating: filters?['maxRating'],
        recruitingPhd: filters?['recruitingPhd'],
        recruitingPostdoc: filters?['recruitingPostdoc'],
        recruitingIntern: filters?['recruitingIntern'],
        ordering: _convertSortToOrdering(sortBy),
        page: page,
        limit: limit,
      );
    } catch (e) {
      return [];
    }
  }

  /// Search specifically by professor name
  static Future<List<Lab>> searchByProfessor(String professorName) async {
    try {
      // Use general search but focus on professor field
      return await LabService.searchLabsAdvanced(
        query: professorName,
      );
    } catch (e) {
      return [];
    }
  }

  /// Search specifically by university
  static Future<List<Lab>> searchByUniversity(String universityQuery) async {
    try {
      return await LabService.searchLabsAdvanced(
        query: universityQuery,
      );
    } catch (e) {
      return [];
    }
  }

  /// Search specifically by research area
  static Future<List<Lab>> searchByResearchArea(String researchArea) async {
    try {
      return await LabService.searchLabsAdvanced(
        researchArea: researchArea,
      );
    } catch (e) {
      return [];
    }
  }

  /// Auto-complete suggestions for search
  static Future<List<String>> getSearchSuggestions(String query) async {
    if (query.trim().isEmpty) return [];

    final normalizedQuery = query.trim().toLowerCase();

    // Check cache first
    if (_suggestionCache.containsKey(normalizedQuery)) {
      final cacheTime = _cacheTimestamps[normalizedQuery];
      if (cacheTime != null &&
          DateTime.now().difference(cacheTime) < _cacheExpiry) {
        return _suggestionCache[normalizedQuery]!;
      } else {
        // Remove expired cache
        _suggestionCache.remove(normalizedQuery);
        _cacheTimestamps.remove(normalizedQuery);
      }
    }

    try {
      // Get labs matching the query
      final labs = await LabService.searchLabsAdvanced(
        query: query,
        limit: 10,
      );

      final suggestions = <String>{};

      for (final lab in labs) {
        // Add lab name if it contains the query
        if (lab.name.toLowerCase().contains(normalizedQuery)) {
          suggestions.add(lab.name);
        }

        // Add professor name if it contains the query
        if (lab.professorName.toLowerCase().contains(normalizedQuery)) {
          suggestions.add(lab.professorName);
        }

        // Add university name if it contains the query
        if (lab.universityName.toLowerCase().contains(normalizedQuery)) {
          suggestions.add(lab.universityName);
        }

        // Add research areas if they contain the query
        for (final area in lab.researchAreas) {
          if (area.toLowerCase().contains(normalizedQuery)) {
            suggestions.add(area);
          }
        }
      }

      final suggestionList = suggestions.take(8).toList(); // Limit to 8 suggestions

      // Cache the results
      _suggestionCache[normalizedQuery] = suggestionList;
      _cacheTimestamps[normalizedQuery] = DateTime.now();

      return suggestionList;
    } catch (e) {
      return [];
    }
  }

  /// Get popular search terms
  static List<String> getPopularSearchTerms() {
    return [
      'Machine Learning',
      'Computer Vision',
      'Natural Language Processing',
      'Robotics',
      'AI Safety',
      'Deep Learning',
      'Stanford',
      'MIT',
      'Carnegie Mellon',
      'UC Berkeley',
    ];
  }

  /// Clear suggestion cache
  static void clearSuggestionCache() {
    _suggestionCache.clear();
    _cacheTimestamps.clear();
  }

  /// Determine search intent based on query
  static SearchIntent analyzeSearchIntent(String query) {
    final lowerQuery = query.toLowerCase().trim();

    // Check for university indicators
    if (_containsUniversityKeywords(lowerQuery)) {
      return SearchIntent.university;
    }

    // Check for professor indicators (Dr., Prof., common names)
    if (_containsProfessorKeywords(lowerQuery)) {
      return SearchIntent.professor;
    }

    // Check for research area indicators
    if (_containsResearchAreaKeywords(lowerQuery)) {
      return SearchIntent.researchArea;
    }

    // Check for lab indicators
    if (_containsLabKeywords(lowerQuery)) {
      return SearchIntent.labName;
    }

    // Default to general search
    return SearchIntent.general;
  }

  static bool _containsUniversityKeywords(String query) {
    final universityKeywords = [
      'university', 'college', 'institute', 'school',
      'mit', 'stanford', 'harvard', 'berkeley', 'carnegie',
      'princeton', 'yale', 'cornell', 'columbia', 'caltech'
    ];
    return universityKeywords.any((keyword) => query.contains(keyword));
  }

  static bool _containsProfessorKeywords(String query) {
    final professorKeywords = [
      'dr.', 'prof.', 'professor', 'dr ', 'prof '
    ];
    return professorKeywords.any((keyword) => query.contains(keyword));
  }

  static bool _containsResearchAreaKeywords(String query) {
    final researchKeywords = [
      'machine learning', 'deep learning', 'ai', 'artificial intelligence',
      'computer vision', 'nlp', 'natural language', 'robotics',
      'reinforcement learning', 'neural network', 'data science'
    ];
    return researchKeywords.any((keyword) => query.contains(keyword));
  }

  static bool _containsLabKeywords(String query) {
    final labKeywords = [
      'lab', 'laboratory', 'research group', 'center', 'institute'
    ];
    return labKeywords.any((keyword) => query.contains(keyword));
  }

  /// Convert UI sort option to backend ordering parameter
  static String? _convertSortToOrdering(String? sortBy) {
    switch (sortBy) {
      case 'rating':
        return '-overall_rating'; // Highest rated first
      case 'reviews':
        return '-review_count'; // Most reviewed first
      case 'lab':
        return 'name'; // Lab name A-Z
      case 'professor':
        return 'professor__name'; // Professor name A-Z
      case 'newest':
        return '-created_at'; // Newest first
      default:
        return '-overall_rating'; // Default to rating
    }
  }
}

enum SearchIntent {
  general,
  university,
  professor,
  labName,
  researchArea,
}
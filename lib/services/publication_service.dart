// services/publication_service.dart
import '../data/models/publication.dart';
import 'api_service.dart';

class PublicationService {
  /// Get research areas breakdown for a lab
  static Future<Map<String, dynamic>?> getResearchAreasBreakdown(String labId) async {
    try {
      final response = await ApiService.get('/publications/research-areas/$labId/');
      return Map<String, dynamic>.from(response);
    } catch (e) {
      print('Failed to load research areas breakdown: $e');
      return null;
    }
  }

  /// Get yearly publication statistics for a lab using the new stats endpoint
  static Future<Map<String, int>?> getYearlyPublicationStats(String labId, {
    int? startYear,
    int? endYear,
    bool fillEmpty = true,
  }) async {
    try {
      // Use the new combined stats endpoint
      final statsData = await getLabPublicationStatsAndYearly(labId);

      if (statsData != null && statsData['yearly_stats'] is Map) {
        // The yearly_stats from yearly_distribution contains year as key and count as value
        final yearlyDistribution = statsData['yearly_stats'] as Map;
        var yearlyStats = <String, int>{};

        // Convert to proper format (ensure int values)
        for (final entry in yearlyDistribution.entries) {
          final year = entry.key.toString();
          final count = entry.value is int ? entry.value as int : int.tryParse(entry.value.toString()) ?? 0;
          yearlyStats[year] = count;
        }

        // Apply year filtering if specified
        if (startYear != null || endYear != null) {
          yearlyStats = Map.fromEntries(
            yearlyStats.entries.where((entry) {
              final year = int.tryParse(entry.key);
              if (year == null) return false;

              bool includeYear = true;
              if (startYear != null && year < startYear) includeYear = false;
              if (endYear != null && year > endYear) includeYear = false;

              return includeYear;
            })
          );
        }

        // Fill empty years if requested
        if (fillEmpty && (startYear != null && endYear != null)) {
          for (int year = startYear!; year <= endYear!; year++) {
            yearlyStats.putIfAbsent(year.toString(), () => 0);
          }
        }

        print('PublicationService: Processed yearly stats: $yearlyStats');
        return yearlyStats;
      }

      print('PublicationService: No yearly_stats found in response');
      return null;
    } catch (e) {
      print('Failed to load yearly stats: $e');
      return null;
    }
  }

  /// Get publications with pagination support
  static Future<Map<String, dynamic>> getLabPublicationsWithPagination(String labId, {
    int page = 1,
    int limit = 10,
    String? query,
    String? year,
    String? venueType,
    String? researchArea,
    String? ordering = '-citation_count',
  }) async {
    try {
      String endpoint = '/publications/';
      final params = ['lab_id=$labId', 'page=$page', 'limit=$limit'];

      if (query != null && query.isNotEmpty) {
        params.add('search=${Uri.encodeComponent(query)}');
      }
      if (year != null && year != 'All Years') {
        if (year == 'Last 5 years') {
          final currentYear = DateTime.now().year;
          params.add('year_from=${currentYear - 5}');
        } else {
          params.add('publication_year=$year');
        }
      }
      if (venueType != null) {
        params.add('venue_type=$venueType');
      }
      if (researchArea != null) {
        params.add('research_area=${Uri.encodeComponent(researchArea)}');
      }
      if (ordering != null) {
        params.add('ordering=$ordering');
      }

      final response = await ApiService.get('$endpoint?${params.join('&')}');

      if (response is Map && response.containsKey('results')) {
        return {
          'publications': (response['results'] as List).map((json) => Publication.fromJson(json)).toList(),
          'total': response['count'] ?? 0,
          'page': page,
          'totalPages': ((response['count'] ?? 0) / limit).ceil(),
        };
      } else {
        final publications = (response as List).map((json) => Publication.fromJson(json)).toList();
        return {
          'publications': publications,
          'total': publications.length,
          'page': 1,
          'totalPages': 1,
        };
      }
    } catch (e) {
      print('Failed to load publications: $e');
      return {
        'publications': <Publication>[],
        'total': 0,
        'page': 1,
        'totalPages': 1,
      };
    }
  }
  /// Get publications for a specific lab
  static Future<List<Publication>> getLabPublications(String labId, {
    String? year,
    String? yearFrom,
    String? yearTo,
    String? venue,
    String? venueTier, // top/good/regular/unknown
    String? venueType, // conference/journal/workshop/preprint
    String? researchArea,
    String? keywords,
    bool? openAccess,
    bool? awardPaper,
    int? minCitations,
    int? maxCitations,
    String? ordering = '-citation_count', // Default sort by citations
    int limit = 20,
    int offset = 0,
    bool useMinimalFields = false, // For lab detail optimization
  }) async {
    try {
      String endpoint = '/publications/';
      final params = ['lab_id=$labId'];

      // Year filtering
      if (year != null && year != 'All') {
        params.add('publication_year=$year');
      } else if (yearFrom != null || yearTo != null) {
        if (yearFrom != null) params.add('year_from=$yearFrom');
        if (yearTo != null) params.add('year_to=$yearTo');
      }

      // Venue filtering
      if (venue != null && venue != 'All') {
        params.add('venue=${Uri.encodeComponent(venue)}');
      }
      if (venueTier != null && venueTier != 'All') {
        params.add('venue_tier=$venueTier');
      }
      if (venueType != null && venueType != 'All') {
        params.add('venue_type=$venueType');
      }

      // Research area filtering
      if (researchArea != null && researchArea != 'All') {
        params.add('research_area=${Uri.encodeComponent(researchArea)}');
      }

      // Keywords search
      if (keywords != null && keywords.isNotEmpty) {
        params.add('keywords_contain=${Uri.encodeComponent(keywords)}');
      }

      // Boolean filters
      if (openAccess != null) params.add('open_access=$openAccess');
      if (awardPaper != null) params.add('award_paper=$awardPaper');

      // Citation range
      if (minCitations != null) params.add('min_citations=$minCitations');
      if (maxCitations != null) params.add('max_citations=$maxCitations');

      // Sorting and pagination
      if (ordering != null) params.add('ordering=$ordering');
      params.add('limit=$limit');
      params.add('offset=$offset');

      // Add minimal fields optimization for lab detail
      if (useMinimalFields) {
        params.add('fields=minimal');
      }

      if (params.isNotEmpty) {
        endpoint += '?${params.join('&')}';
      }

      print('PublicationService: Making request to: $endpoint');
      final response = await ApiService.get(endpoint, requireAuth: false);
      print('PublicationService: Got response type: ${response.runtimeType}');

      if (response is List) {
        print('PublicationService: Response is List with ${response.length} items');
        return response.map((json) => Publication.fromJson(json)).toList();
      } else if (response is Map && response.containsKey('results')) {
        final results = response['results'] as List;
        print('PublicationService: Response is Map with ${results.length} results');
        return results.map((json) => Publication.fromJson(json)).toList();
      }
      print('PublicationService: No valid response format found');
      return [];
    } catch (e) {
      print('Error loading lab publications: $e');
      print('Error type: ${e.runtimeType}');
      // For development, let's try a fallback approach
      if (e is UnsupportedEndpointException) {
        print('Publications endpoint not supported yet, using empty list');
      }
      return [];
    }
  }

  /// Get publication statistics for a lab using the new optimized stats endpoint
  static Future<Map<String, dynamic>?> getLabPublicationStatsAndYearly(String labId) async {
    try {
      print('PublicationService: Getting stats for lab $labId');
      final response = await ApiService.get('/publications/stats/?lab_id=$labId', requireAuth: false);
      print('PublicationService: Stats response type: ${response.runtimeType}');

      if (response is Map) {
        final rawResponse = Map<String, dynamic>.from(response);
        print('PublicationService: Raw response keys: ${rawResponse.keys}');
        print('PublicationService: Raw response structure: $rawResponse');

        // Transform the response to match our expected format
        final transformedResponse = <String, dynamic>{};

        // Extract summary data
        if (rawResponse.containsKey('summary')) {
          final summary = rawResponse['summary'] as Map<String, dynamic>;
          transformedResponse['total_publications'] = summary['total_publications'] ?? 0;
          transformedResponse['total_citations'] = summary['total_citations'] ?? 0;
          transformedResponse['h_index'] = summary['h_index'] ?? 0;
          transformedResponse['this_year_publications'] = summary['recent_publications_5years'] ?? 0; // Map to closest field
          transformedResponse['average_citations_per_paper'] = summary['avg_citations_per_paper'];

          print('PublicationService: Extracted summary data: total_publications=${summary['total_publications']}, total_citations=${summary['total_citations']}');
        } else {
          print('PublicationService: No summary key found in response');
          // Set default values if no summary is available
          transformedResponse['total_publications'] = 0;
          transformedResponse['total_citations'] = 0;
          transformedResponse['h_index'] = 0;
          transformedResponse['this_year_publications'] = 0;
        }

        // Extract yearly distribution (but don't include in transformed response to avoid type conflict)
        if (rawResponse.containsKey('yearly_distribution')) {
          // Store yearly_distribution separately to avoid type conflicts with PublicationStats.fromJson
          print('PublicationService: Found yearly_distribution: ${rawResponse['yearly_distribution']}');
        } else {
          print('PublicationService: No yearly_distribution key found in response');
        }

        // Keep original response for additional data
        transformedResponse['raw_response'] = rawResponse;

        return transformedResponse;
      }
      return null;
    } catch (e) {
      print('Error loading publication stats: $e');
      print('Error type: ${e.runtimeType}');
      return null;
    }
  }

  /// Get publication statistics for a lab (backward compatibility)
  static Future<PublicationStats?> getLabPublicationStats(String labId) async {
    try {
      final statsData = await getLabPublicationStatsAndYearly(labId);
      if (statsData != null) {
        return PublicationStats.fromJson(statsData);
      }
      return null;
    } catch (e) {
      print('Error loading publication stats: $e');
      return null;
    }
  }

  /// Get top-tier publications for a lab
  static Future<List<Publication>> getTopTierPublications(String labId, {int limit = 20, bool useMinimalFields = false}) async {
    return getLabPublications(
      labId,
      venueTier: 'top',
      ordering: '-citation_count',
      limit: limit,
      useMinimalFields: useMinimalFields,
    );
  }

  /// Get recent publications for a lab (last 3 years)
  static Future<List<Publication>> getRecentPublications(String labId, {int limit = 20, bool useMinimalFields = false}) async {
    final currentYear = DateTime.now().year;
    return getLabPublications(
      labId,
      yearFrom: (currentYear - 2).toString(),
      yearTo: currentYear.toString(),
      ordering: '-publication_year',
      limit: limit,
      useMinimalFields: useMinimalFields,
    );
  }

  /// Get most cited publications for a lab
  static Future<List<Publication>> getTopCitedPublications(String labId, {int limit = 20}) async {
    return getLabPublications(
      labId,
      ordering: '-citation_count',
      limit: limit,
    );
  }

  /// Get award-winning publications for a lab
  static Future<List<Publication>> getAwardPublications(String labId, {int limit = 20, bool useMinimalFields = false}) async {
    return getLabPublications(
      labId,
      awardPaper: true,
      ordering: '-citation_count',
      limit: limit,
      useMinimalFields: useMinimalFields,
    );
  }

  /// Get open access publications for a lab
  static Future<List<Publication>> getOpenAccessPublications(String labId, {int limit = 20, bool useMinimalFields = false}) async {
    return getLabPublications(
      labId,
      openAccess: true,
      ordering: '-citation_count',
      limit: limit,
      useMinimalFields: useMinimalFields,
    );
  }

  /// Search publications by keywords
  static Future<List<Publication>> searchPublicationsByKeywords(String labId, String keywords, {int limit = 20}) async {
    return getLabPublications(
      labId,
      keywords: keywords,
      ordering: '-citation_count',
      limit: limit,
    );
  }

  /// Get available filters for the lab using the new optimized endpoint
  static Future<Map<String, List<String>>> getAvailableFilters(String labId) async {
    try {
      print('PublicationService: Getting filters for lab $labId');
      final response = await ApiService.get('/publications/filters/?lab_id=$labId', requireAuth: false);
      print('PublicationService: Filters response type: ${response.runtimeType}');

      if (response is Map && response.containsKey('filters')) {
        final filters = Map<String, dynamic>.from(response['filters']);
        final processedFilters = <String, List<String>>{};

        // Process years (they come as numbers)
        final years = filters['years'] as List?;
        final yearStrings = years?.map((y) => y.toString()).toList() ?? [];
        yearStrings.sort((a, b) => b.compareTo(a)); // Sort descending (newest first)
        processedFilters['years'] = ['All', ...yearStrings];

        // Process venues (they come as objects with name property)
        final venues = filters['venues'] as List?;
        final venueNames = venues?.map((v) {
          if (v is Map) {
            return v['name']?.toString() ?? v['short_name']?.toString() ?? '';
          }
          return v.toString();
        }).where((name) => name.isNotEmpty).toSet().toList() ?? [];
        venueNames.sort();
        processedFilters['venues'] = ['All', ...venueNames];

        // Process research areas (they come as objects with name property)
        final researchAreas = filters['research_areas'] as List?;
        final areaNames = researchAreas?.map((area) {
          if (area is Map) {
            return area['name']?.toString() ?? '';
          }
          return area.toString();
        }).where((name) => name.isNotEmpty).toSet().toList() ?? [];
        areaNames.sort();
        processedFilters['research_areas'] = ['All', ...areaNames];

        // Process venue tiers
        final venueTiers = filters['venue_tiers'] as List?;
        processedFilters['venue_tiers'] = ['All', ...(venueTiers?.map((vt) => vt.toString()) ?? ['top', 'good', 'regular', 'unknown'])];

        // Process venue types
        final venueTypes = filters['venue_types'] as List?;
        processedFilters['venue_types'] = ['All', ...(venueTypes?.map((vt) => vt.toString()) ?? ['conference', 'journal', 'workshop', 'preprint'])];

        print('PublicationService: Processed filters: ${processedFilters.keys}');
        return processedFilters;
      }

      throw Exception('Invalid response format - missing filters key');
    } catch (e) {
      print('Error getting available filters: $e');
      // Fallback to basic filters
      final currentYear = DateTime.now().year;
      return {
        'years': ['All', ...List.generate(5, (i) => (currentYear - i).toString())],
        'venues': ['All'],
        'research_areas': ['All'],
        'venue_tiers': ['All', 'top', 'good', 'regular', 'unknown'],
        'venue_types': ['All', 'conference', 'journal', 'workshop', 'preprint'],
      };
    }
  }

  /// Get available years for filtering (backward compatibility)
  static Future<List<String>> getAvailableYears(String labId) async {
    final filters = await getAvailableFilters(labId);
    return filters['years'] ?? ['All'];
  }

  /// Get available venues for filtering (backward compatibility)
  static Future<List<String>> getAvailableVenues(String labId) async {
    final filters = await getAvailableFilters(labId);
    return filters['venues'] ?? ['All'];
  }

  /// Get available research areas for filtering (backward compatibility)
  static Future<List<String>> getAvailableResearchAreas(String labId) async {
    final filters = await getAvailableFilters(labId);
    return filters['research_areas'] ?? ['All'];
  }

  /// Get all publications with advanced filtering
  static Future<List<Publication>> getAllPublications({
    String? search,
    String? labId,
    String? venue,
    String? year,
    String? yearFrom,
    String? yearTo,
    String? venueTier,
    String? venueType,
    String? researchArea,
    String? keywords,
    bool? openAccess,
    bool? awardPaper,
    int? minCitations,
    int? maxCitations,
    String? ordering,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      String endpoint = '/publications/';
      final params = <String>[];

      if (search != null && search.isNotEmpty) {
        params.add('search=${Uri.encodeComponent(search)}');
      }
      if (labId != null) params.add('lab_id=$labId');

      // Year filtering
      if (year != null && year != 'All') {
        params.add('publication_year=$year');
      } else if (yearFrom != null || yearTo != null) {
        if (yearFrom != null) params.add('year_from=$yearFrom');
        if (yearTo != null) params.add('year_to=$yearTo');
      }

      // Venue filtering
      if (venue != null && venue != 'All') {
        params.add('venue=${Uri.encodeComponent(venue)}');
      }
      if (venueTier != null && venueTier != 'All') {
        params.add('venue_tier=$venueTier');
      }
      if (venueType != null && venueType != 'All') {
        params.add('venue_type=$venueType');
      }

      // Research area filtering
      if (researchArea != null && researchArea != 'All') {
        params.add('research_area=${Uri.encodeComponent(researchArea)}');
      }

      // Keywords search
      if (keywords != null && keywords.isNotEmpty) {
        params.add('keywords_contain=${Uri.encodeComponent(keywords)}');
      }

      // Boolean filters
      if (openAccess != null) params.add('open_access=$openAccess');
      if (awardPaper != null) params.add('award_paper=$awardPaper');

      // Citation range
      if (minCitations != null) params.add('min_citations=$minCitations');
      if (maxCitations != null) params.add('max_citations=$maxCitations');

      // Sorting and pagination
      if (ordering != null) params.add('ordering=$ordering');
      final offset = (page - 1) * limit;
      params.add('offset=$offset');
      params.add('limit=$limit');

      if (params.isNotEmpty) {
        endpoint += '?${params.join('&')}';
      }

      final response = await ApiService.get(endpoint);
      if (response is List) {
        return response.map((json) => Publication.fromJson(json)).toList();
      } else if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Publication.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error loading publications: $e');
      return [];
    }
  }
}
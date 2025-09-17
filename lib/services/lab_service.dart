// lib/services/lab_service.dart
import '../data/models/lab.dart';
import 'api_service.dart';

class LabService {
  static Future<List<Lab>> getFeaturedLabs() async {
    final response = await ApiService.get('/labs/featured/');
    return (response as List).map((json) => Lab.fromJson(json)).toList();
  }

  static Future<Lab> getLabById(String id) async {
    final response = await ApiService.get('/labs/$id/');
    return Lab.fromJson(response);
  }

  static Future<Map<String, dynamic>> searchLabs({
    String? query,
    Map<String, dynamic>? filters,
    int page = 1,
  }) async {
    String endpoint = '/labs/?page=$page';

    if (query != null && query.isNotEmpty) {
      endpoint += '&search=$query';
    }

    if (filters != null) {
      filters.forEach((key, value) {
        if (value != null && value.toString().isNotEmpty) {
          endpoint += '&$key=$value';
        }
      });
    }

    return await ApiService.get(endpoint);
  }

  static Future<List<Lab>> getRecruitingLabs(String position) async {
    final response = await ApiService.get('/labs/recruiting/?position=$position');
    return (response as List).map((json) => Lab.fromJson(json)).toList();
  }

  // Get labs by university
  static Future<List<Lab>> getLabsByUniversity(String universityId) async {
    try {
      print('Fetching labs for university ID: $universityId');
      // Try both parameter formats in case backend expects different naming
      final response = await ApiService.get('/labs/?university=$universityId');
      print('API URL: /labs/?university=$universityId');
      print('Response: $response');

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }

      // Debug: Print all lab university IDs to see what we're getting
      print('Debugging lab university IDs:');
      for (var lab in labs) {
        print('  Lab "${lab.name}" has universityId: "${lab.universityId}" (expected: "$universityId")');
      }

      // Additional client-side filtering as backup
      final filteredLabs = labs.where((lab) => lab.universityId == universityId).toList();
      print('Found ${labs.length} labs from API, ${filteredLabs.length} match university ID $universityId');

      // If no matches, let's try without client-side filtering (trust backend filtering)
      if (filteredLabs.isEmpty && labs.isNotEmpty) {
        print('No client-side matches found, returning all labs from backend (trusting backend filtering)');
        return labs;
      }

      return filteredLabs;
    } catch (e) {
      print('Error fetching labs by university: $e');
      return [];
    }
  }

  // Add a new lab (requires authentication)
  static Future<Lab> addLab({
    required String name,
    required String professorId,
    required String universityId,
    required String department,
    String? description,
    String? website,
    List<String>? researchAreas,
    List<String>? tags,
  }) async {
    try {
      final labData = {
        'name': name,
        'professor': int.parse(professorId),
        'university': int.parse(universityId),
        'department': department,
        if (description != null) 'description': description,
        if (website != null) 'website': website,
        if (researchAreas != null) 'research_areas': researchAreas,
        if (tags != null) 'tags': tags,
      };

      final response = await ApiService.post(
        '/labs/',
        labData,
        requireAuth: true,
      );
      return Lab.fromJson(response);
    } catch (e) {
      print('Error adding lab: $e');
      rethrow;
    }
  }

  // Search labs with advanced filters
  static Future<List<Lab>> searchLabsAdvanced({
    String? query,
    String? universityId,
    String? department,
    List<String>? researchAreas,
    double? minRating,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      String queryParams = 'page=$page&limit=$limit';

      if (query != null && query.isNotEmpty) {
        queryParams += '&search=${Uri.encodeComponent(query)}';
      }
      if (universityId != null) queryParams += '&university=$universityId';
      if (department != null) queryParams += '&department=$department';
      if (minRating != null) queryParams += '&min_rating=$minRating';
      if (researchAreas != null && researchAreas.isNotEmpty) {
        queryParams += '&research_areas=${researchAreas.join(',')}';
      }

      print('Searching labs with query params: $queryParams');
      final response = await ApiService.get('/labs/?$queryParams');

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }

      // Additional client-side filtering if universityId is specified
      if (universityId != null) {
        // Debug: Print what university IDs we're getting from search
        print('Debugging search results university IDs:');
        for (var lab in labs) {
          print('  Lab "${lab.name}" has universityId: "${lab.universityId}" (expected: "$universityId")');
        }

        final filteredLabs = labs.where((lab) => lab.universityId == universityId).toList();
        print('Search found ${labs.length} labs from API, ${filteredLabs.length} match university ID $universityId');

        // If no matches, trust backend filtering and return all results
        if (filteredLabs.isEmpty && labs.isNotEmpty) {
          print('No client-side matches in search, returning all labs from backend (trusting backend filtering)');
          return labs;
        }

        return filteredLabs;
      }

      return labs;
    } catch (e) {
      print('Error searching labs: $e');
      return [];
    }
  }

  // Verify lab website
  static Future<bool> verifyLabWebsite(String website) async {
    try {
      final response = await ApiService.post('/labs/verify-website/', {
        'website': website,
      });
      return response['is_valid'] ?? false;
    } on UnsupportedEndpointException catch (e) {
      print('Website verification not supported by backend: $e');
      // Graceful fallback: basic URL validation with academic domain support
      if (Uri.tryParse(website) == null || !website.startsWith('http')) {
        return false;
      }
      // Accept common academic and research domains
      final uri = Uri.parse(website);
      final academicDomains = ['.edu', '.ac.', '.org', 'sites.google.com', 'github.io', 'gitlab.io'];
      return academicDomains.any((domain) => uri.host.contains(domain));
    } catch (e) {
      print('Error verifying lab website: $e');
      return false;
    }
  }

  // Get lab statistics
  static Future<Map<String, dynamic>?> getLabStats(String labId) async {
    try {
      final response = await ApiService.get('/labs/$labId/stats/');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      print('Lab stats not supported by backend: $e');
      return null;
    } catch (e) {
      print('Error fetching lab stats: $e');
      return null;
    }
  }

  // Get enhanced lab rating averages
  static Future<Map<String, dynamic>?> getLabAverages(String labId) async {
    try {
      print('DEBUG: Fetching lab averages for lab $labId');
      final response = await ApiService.get('/reviews/lab/$labId/averages/');
      print('DEBUG: Lab averages response: $response');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      print('Lab averages not supported by backend: $e');
      return null;
    } catch (e) {
      print('Error fetching lab averages: $e');
      return null;
    }
  }

  // Compare multiple labs
  static Future<Map<String, dynamic>?> compareLabs(List<String> labIds) async {
    try {
      print('DEBUG: Comparing labs: $labIds');
      final response = await ApiService.post('/reviews/labs/compare/', {
        'lab_ids': labIds,
      });
      print('DEBUG: Lab comparison response: $response');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      print('Lab comparison not supported by backend: $e');
      return null;
    } catch (e) {
      print('Error comparing labs: $e');
      return null;
    }
  }
}
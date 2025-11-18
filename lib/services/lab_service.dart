// lib/services/lab_service.dart
import '../data/models/lab.dart';
import 'api_service.dart';

class LabSearchResult {
  final List<Lab> labs;
  final int totalCount;

  LabSearchResult({required this.labs, required this.totalCount});
}

class LabService {
  static Future<List<Lab>> getFeaturedLabs() async {
    final response = await ApiService.get('/labs/featured/');
    return (response as List).map((json) => Lab.fromJson(json)).toList();
  }

  static Future<Lab> getLabById(String id) async {
    try {
      final response = await ApiService.get('/labs/$id/');
      print('DEBUG getLabById: Raw response type: ${response.runtimeType}');
      print('DEBUG getLabById: Raw response: $response');

      if (response is List) {
        print('DEBUG getLabById: Response is a List with ${response.length} items');
        if (response.isEmpty) {
          throw Exception('Lab with ID $id not found (empty response)');
        }
        // If it's a list, take the first item
        print('DEBUG getLabById: Using first item from list: ${response.first}');
        return Lab.fromJson(response.first);
      } else if (response is Map) {
        print('DEBUG getLabById: Response is a Map, parsing directly');
        return Lab.fromJson(Map<String, dynamic>.from(response));
      } else {
        throw Exception('Unexpected response type: ${response.runtimeType}');
      }
    } catch (e) {
      print('DEBUG getLabById: Error occurred: $e');
      rethrow;
    }
  }

  static Future<Lab?> getLabByName(String name) async {
    try {
      final response = await searchLabs(query: name);

      if (response['results'] != null && response['results'].isNotEmpty) {
        final results = response['results'] as List;

        for (var labData in results) {
          final lab = Lab.fromJson(labData);
          if (lab.name.toLowerCase() == name.toLowerCase()) {
            return lab;
          }
        }

        return Lab.fromJson(results.first);
      }

      return null;
    } catch (e) {
      return null;
    }
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
  static Future<List<Lab>> getLabsByUniversity(String universityId, {bool useMinimalFields = false}) async {
    try {
      // Try both parameter formats in case backend expects different naming
      String endpoint = '/labs/?university=$universityId';
      if (useMinimalFields) {
        endpoint += '&fields=minimal';
      }

      final response = await ApiService.get(endpoint);

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }


      // Additional client-side filtering as backup
      final filteredLabs = labs.where((lab) => lab.universityId == universityId).toList();

      // If no matches, let's try without client-side filtering (trust backend filtering)
      if (filteredLabs.isEmpty && labs.isNotEmpty) {
        return labs;
      }

      return filteredLabs;
    } catch (e) {
      return [];
    }
  }

  // Get labs by research group
  static Future<List<Lab>> getLabsByResearchGroup(String researchGroupId) async {
    try {
      final response = await ApiService.get('/labs/?research_group=$researchGroupId');

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }

      return labs;
    } catch (e) {
      return [];
    }
  }

  // Get labs by university and department (when no research group is selected)
  static Future<List<Lab>> getLabsByUniversityDepartment(String universityId, String universityDepartmentId, {bool useMinimalFields = false}) async {
    try {
      print('DEBUG getLabsByUniversityDepartment: Using university_department=$universityDepartmentId');
      String endpoint = '/labs/?university_department=$universityDepartmentId';
      if (useMinimalFields) {
        endpoint += '&fields=minimal';
      }

      final response = await ApiService.get(endpoint);

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }

      return labs;
    } catch (e) {
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
    int? labSize,
    List<String>? researchAreas,
    List<String>? tags,
    String? researchGroupId,
  }) async {
    try {
      final labData = {
        'name': name,
        'professor': int.parse(professorId),
        'university': int.parse(universityId),
        'department': department,
        if (description != null) 'description': description,
        if (website != null) 'website': website,
        if (labSize != null) 'lab_size': labSize,
        if (researchAreas != null) 'research_areas': researchAreas,
        if (tags != null) 'tags': tags,
        if (researchGroupId != null) 'research_group': int.parse(researchGroupId),
      };

      final response = await ApiService.post(
        '/labs/',
        labData,
        requireAuth: true,
      );
      return Lab.fromJson(response);
    } catch (e) {
      rethrow;
    }
  }

  // Search labs with advanced filters
  static Future<List<Lab>> searchLabsAdvanced({
    String? query,
    String? university,
    String? professor,
    String? department,
    String? researchArea,
    String? tag,
    double? minRating,
    double? maxRating,
    bool? recruitingPhd,
    bool? recruitingPostdoc,
    bool? recruitingIntern,
    String? ordering,
    int page = 1,
    int limit = 20,
    bool useMinimalFields = false,
  }) async {
    try {
      String queryParams = 'page=$page&limit=$limit';

      if (query != null && query.isNotEmpty) {
        queryParams += '&search=${Uri.encodeComponent(query)}';
      }
      if (university != null) queryParams += '&university=${Uri.encodeComponent(university)}';
      if (professor != null) queryParams += '&professor=${Uri.encodeComponent(professor)}';
      if (department != null) queryParams += '&department=${Uri.encodeComponent(department)}';
      if (researchArea != null) queryParams += '&research_area=${Uri.encodeComponent(researchArea)}';
      if (tag != null) queryParams += '&tag=${Uri.encodeComponent(tag)}';
      if (minRating != null) queryParams += '&min_rating=$minRating';
      if (maxRating != null) queryParams += '&max_rating=$maxRating';
      if (recruitingPhd != null) queryParams += '&recruiting_phd=$recruitingPhd';
      if (recruitingPostdoc != null) queryParams += '&recruiting_postdoc=$recruitingPostdoc';
      if (recruitingIntern != null) queryParams += '&recruiting_intern=$recruitingIntern';
      if (ordering != null) queryParams += '&ordering=${Uri.encodeComponent(ordering)}';
      if (useMinimalFields) queryParams += '&fields=minimal';

      final response = await ApiService.get('/labs/?$queryParams');

      List<Lab> labs;
      if (response is Map && response.containsKey('results')) {
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
      }

      return labs;
    } catch (e) {
      return [];
    }
  }

  // Search labs with advanced filters and return LabSearchResult with total count
  static Future<LabSearchResult> searchLabsAdvancedWithCount({
    String? query,
    String? university,
    String? professor,
    String? department,
    String? researchArea,
    String? tag,
    double? minRating,
    double? maxRating,
    bool? recruitingPhd,
    bool? recruitingPostdoc,
    bool? recruitingIntern,
    String? ordering,
    int page = 1,
    int limit = 20,
    bool useMinimalFields = false,
  }) async {
    try {
      String queryParams = 'page=$page&limit=$limit';

      if (query != null && query.isNotEmpty) {
        queryParams += '&search=${Uri.encodeComponent(query)}';
      }
      if (university != null) queryParams += '&university=${Uri.encodeComponent(university)}';
      if (professor != null) queryParams += '&professor=${Uri.encodeComponent(professor)}';
      if (department != null) queryParams += '&department=${Uri.encodeComponent(department)}';
      if (researchArea != null) queryParams += '&research_area=${Uri.encodeComponent(researchArea)}';
      if (tag != null) queryParams += '&tag=${Uri.encodeComponent(tag)}';
      if (minRating != null) queryParams += '&min_rating=$minRating';
      if (maxRating != null) queryParams += '&max_rating=$maxRating';
      if (recruitingPhd != null) queryParams += '&recruiting_phd=$recruitingPhd';
      if (recruitingPostdoc != null) queryParams += '&recruiting_postdoc=$recruitingPostdoc';
      if (recruitingIntern != null) queryParams += '&recruiting_intern=$recruitingIntern';
      if (ordering != null) queryParams += '&ordering=${Uri.encodeComponent(ordering)}';
      if (useMinimalFields) queryParams += '&fields=minimal';

      final response = await ApiService.get('/labs/?$queryParams');

      List<Lab> labs;
      int totalCount = 0;

      if (response is Map && response.containsKey('results')) {
        // Paginated response with count
        labs = (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
        totalCount = response['count'] ?? labs.length;
      } else {
        // Direct array response (fallback)
        labs = (response as List).map((json) => Lab.fromJson(json)).toList();
        totalCount = labs.length;
      }

      return LabSearchResult(labs: labs, totalCount: totalCount);
    } catch (e) {
      return LabSearchResult(labs: [], totalCount: 0);
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
      // Graceful fallback: basic URL validation with academic domain support
      if (Uri.tryParse(website) == null || !website.startsWith('http')) {
        return false;
      }
      // Accept common academic and research domains
      final uri = Uri.parse(website);
      final academicDomains = ['.edu', '.ac.', '.org', 'sites.google.com', 'github.io', 'gitlab.io'];
      return academicDomains.any((domain) => uri.host.contains(domain));
    } catch (e) {
      return false;
    }
  }

  // Get lab statistics
  static Future<Map<String, dynamic>?> getLabStats(String labId) async {
    try {
      final response = await ApiService.get('/labs/$labId/stats/');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      return null;
    } catch (e) {
      return null;
    }
  }

  // Get enhanced lab rating averages
  static Future<Map<String, dynamic>?> getLabAverages(String labId) async {
    try {
      final response = await ApiService.get('/reviews/lab/$labId/averages/');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      return null;
    } catch (e) {
      return null;
    }
  }

  // Compare multiple labs
  static Future<Map<String, dynamic>?> compareLabs(List<String> labIds) async {
    try {
      final response = await ApiService.post('/reviews/labs/compare/', {
        'lab_ids': labIds,
      });
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      return null;
    } catch (e) {
      return null;
    }
  }
}
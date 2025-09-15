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
      final response = await ApiService.get('/labs/?university_id=$universityId');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Lab.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching labs by university: $e');
      return [];
    }
  }

  // Add a new lab (requires authentication)
  static Future<Lab> addLab({
    required String name,
    required String professorName,
    required String universityId,
    required String website,
    String? department,
    String? description,
    List<String>? researchAreas,
  }) async {
    try {
      final labData = {
        'name': name,
        'professor_name': professorName,
        'university_id': universityId,
        'website': website,
        if (department != null) 'department': department,
        if (description != null) 'description': description,
        if (researchAreas != null) 'research_areas': researchAreas,
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
      if (universityId != null) queryParams += '&university_id=$universityId';
      if (department != null) queryParams += '&department=$department';
      if (minRating != null) queryParams += '&min_rating=$minRating';
      if (researchAreas != null && researchAreas.isNotEmpty) {
        queryParams += '&research_areas=${researchAreas.join(',')}';
      }

      final response = await ApiService.get('/labs/?$queryParams');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Lab.fromJson(json)).toList();
      }
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
    } catch (e) {
      print('Error fetching lab stats: $e');
      return null;
    }
  }
}
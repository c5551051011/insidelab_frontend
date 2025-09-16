// lib/services/university_service.dart
import '../data/models/university.dart';
import '../data/models/professor.dart';
import '../data/models/lab.dart';
import 'api_service.dart';

class UniversityService {
  static Future<List<University>> getAllUniversities({String? search, int page = 1, int limit = 50}) async {
    try {
      String queryParams = 'page=$page&limit=$limit';
      if (search != null && search.isNotEmpty) {
        queryParams += '&search=${Uri.encodeComponent(search)}';
      }

      final response = await ApiService.get('/universities/?$queryParams');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => University.fromJson(json))
            .toList();
      } else {
        return (response as List)
            .map((json) => University.fromJson(json))
            .toList();
      }
    } catch (e) {
      print('Error fetching universities: $e');
      return [];
    }
  }

  static Future<University> getUniversityById(String id) async {
    final response = await ApiService.get('/universities/$id/');
    return University.fromJson(response);
  }

  static Future<List<Professor>> getUniversityProfessors(String universityId) async {
    final response = await ApiService.get('/universities/$universityId/professors/');

    if (response is Map && response.containsKey('results')) {
      return (response['results'] as List)
          .map((json) => Professor.fromJson(json))
          .toList();
    } else {
      return (response as List)
          .map((json) => Professor.fromJson(json))
          .toList();
    }
  }

  static Future<List<Lab>> getUniversityLabs(String universityId) async {
    final response = await ApiService.get('/universities/$universityId/labs/');

    if (response is Map && response.containsKey('results')) {
      return (response['results'] as List)
          .map((json) => Lab.fromJson(json))
          .toList();
    } else {
      return (response as List)
          .map((json) => Lab.fromJson(json))
          .toList();
    }
  }

  static Future<List<Professor>> getAllProfessors() async {
    final response = await ApiService.get('/universities/professors/');

    if (response is Map && response.containsKey('results')) {
      return (response['results'] as List)
          .map((json) => Professor.fromJson(json))
          .toList();
    } else {
      return (response as List)
          .map((json) => Professor.fromJson(json))
          .toList();
    }
  }

  static Future<Professor> getProfessorById(String id) async {
    final response = await ApiService.get('/universities/professors/$id/');
    return Professor.fromJson(response);
  }

  // Add a new professor (requires authentication)
  static Future<Professor> addProfessor({
    required String name,
    required String universityId,
    String? email,
    String? department,
  }) async {
    try {
      final professorData = {
        'name': name,
        'university': int.parse(universityId),
        if (email != null) 'email': email,
        if (department != null) 'department': department,
      };

      final response = await ApiService.post(
        '/universities/professors/',
        professorData,
        requireAuth: true,
      );
      return Professor.fromJson(response);
    } catch (e) {
      print('Error adding professor: $e');
      rethrow;
    }
  }

  // Add a new university (requires authentication)
  static Future<University> addUniversity({
    required String name,
    required String website,
    String? country,
    String? state,
    String? city,
    String? description,
  }) async {
    try {
      final universityData = {
        'name': name,
        'website': website,
        'country': country ?? 'Unknown',
        'state': state ?? 'Unknown',
        'city': city ?? 'Unknown',
        if (description != null) 'description': description,
      };

      final response = await ApiService.post(
        '/universities/',
        universityData,
        requireAuth: true,
      );
      return University.fromJson(response);
    } catch (e) {
      print('Error adding university: $e');
      rethrow;
    }
  }

  // Search universities by name
  static Future<List<University>> searchUniversities(String query) async {
    try {
      return await getAllUniversities(search: query);
    } catch (e) {
      print('Error searching universities: $e');
      return [];
    }
  }

  // Verify university website
  static Future<bool> verifyUniversityWebsite(String website) async {
    try {
      final response = await ApiService.post('/universities/verify-website/', {
        'website': website,
      });
      return response['is_valid'] ?? false;
    } on UnsupportedEndpointException catch (e) {
      print('Website verification not supported by backend: $e');
      // Graceful fallback: basic URL validation
      return Uri.tryParse(website) != null && website.startsWith('http');
    } catch (e) {
      print('Error verifying university website: $e');
      return false;
    }
  }

  // Get university statistics
  static Future<Map<String, dynamic>?> getUniversityStats(String universityId) async {
    try {
      final response = await ApiService.get('/universities/$universityId/stats/');
      return Map<String, dynamic>.from(response);
    } on UnsupportedEndpointException catch (e) {
      print('University stats not supported by backend: $e');
      return null;
    } catch (e) {
      print('Error fetching university stats: $e');
      return null;
    }
  }
}
// lib/services/professor_service.dart
import '../data/models/professor.dart';
import 'api_service.dart';

class ProfessorService {
  // Get all professors (with optional lab filtering)
  static Future<List<Professor>> getAllProfessors({String? labId}) async {
    try {
      String endpoint = '/universities/professors/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Professor.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Professor.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching professors: $e');
      return [];
    }
  }

  /// Get top-cited authors (with optional lab filtering)
  static Future<List<Professor>> getTopCitedAuthors({String? labId}) async {
    try {
      String endpoint = '/authors/top-cited/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Professor.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Professor.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching top-cited authors: $e');
      return [];
    }
  }

  // Get professors by university
  static Future<List<Professor>> getProfessorsByUniversity(String universityId) async {
    try {
      final response = await ApiService.get('/universities/professors/?university=$universityId');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Professor.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Professor.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching professors by university: $e');
      return [];
    }
  }

  // Get a specific professor by ID
  static Future<Professor?> getProfessorById(String professorId) async {
    try {
      final response = await ApiService.get('/universities/professors/$professorId/');
      return Professor.fromJson(response);
    } catch (e) {
      print('Error fetching professor by ID: $e');
      return null;
    }
  }

  // Add a new professor (requires authentication)
  static Future<Professor> addProfessor({
    required String name,
    String? email,
    required String universityId,
    required String department,
    String? profileUrl,
    String? googleScholarUrl,
    String? personalWebsite,
    List<String>? researchInterests,
    String? bio,
  }) async {
    try {
      final professorData = {
        'name': name,
        'university': int.parse(universityId),
        'department': department,
        if (email != null && email.isNotEmpty) 'email': email,
        if (profileUrl != null) 'profile_url': profileUrl,
        if (googleScholarUrl != null) 'google_scholar_url': googleScholarUrl,
        if (personalWebsite != null) 'personal_website': personalWebsite,
        if (researchInterests != null) 'research_interests': researchInterests,
        if (bio != null) 'bio': bio,
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

  // Search professors
  static Future<List<Professor>> searchProfessors(String query) async {
    try {
      final response = await ApiService.get('/universities/professors/?search=${Uri.encodeComponent(query)}');

      if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Professor.fromJson(json))
            .toList();
      } else {
        return (response as List).map((json) => Professor.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error searching professors: $e');
      return [];
    }
  }
}
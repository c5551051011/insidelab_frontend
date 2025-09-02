// lib/services/university_service.dart
import '../data/models/university.dart';
import '../data/models/professor.dart';
import '../data/models/lab.dart';
import 'api_service.dart';

class UniversityService {
  static Future<List<University>> getAllUniversities() async {
    final response = await ApiService.get('/universities/');

    if (response is Map && response.containsKey('results')) {
      return (response['results'] as List)
          .map((json) => University.fromJson(json))
          .toList();
    } else {
      return (response as List)
          .map((json) => University.fromJson(json))
          .toList();
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
}
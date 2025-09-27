// lib/services/university_department_service.dart
import '../data/models/university_department.dart';
import '../data/models/university.dart';
import 'api_service.dart';

class UniversityDepartmentService {
  /// Get all departments for a specific university
  static Future<List<UniversityDepartment>> getDepartmentsByUniversity(String universityId) async {
    try {
      final response = await ApiService.get('/universities/$universityId/departments/');
      return (response as List)
          .map((json) => UniversityDepartment.fromJson(json))
          .toList();
    } catch (e) {
      print('Error loading departments for university $universityId: $e');
      return [];
    }
  }

  /// Get all standalone departments (for creating new university departments)
  static Future<List<Department>> getAllDepartments() async {
    try {
      final response = await ApiService.get('/departments/');
      return (response as List)
          .map((json) => Department.fromJson(json))
          .toList();
    } catch (e) {
      print('Error loading departments: $e');
      return [];
    }
  }

  /// Create a new department
  static Future<Department> createDepartment({
    required String name,
    String? description,
    List<String>? commonNames,
  }) async {
    try {
      final response = await ApiService.post(
        '/departments/',
        {
          'name': name,
          'description': description ?? '',
          'common_names': commonNames ?? [],
        },
        requireAuth: true,
      );
      return Department.fromJson(response);
    } catch (e) {
      rethrow;
    }
  }

  /// Create a new university department (link existing department to university)
  static Future<UniversityDepartment> createUniversityDepartment({
    required String universityId,
    required String departmentId,
    String? localName,
    String? website,
    String? headName,
    int? establishedYear,
  }) async {
    try {
      final response = await ApiService.post(
        '/universities/$universityId/departments/',
        {
          'department_id': int.parse(departmentId),
          'local_name': localName,
          'website': website,
          'head_name': headName,
          'established_year': establishedYear,
          'is_active': true,
        },
        requireAuth: true,
      );
      return UniversityDepartment.fromJson(response);
    } catch (e) {
      rethrow;
    }
  }

  /// Create a new department and link it to a university in one step
  static Future<UniversityDepartment> createNewDepartmentForUniversity({
    required String universityId,
    required String departmentName,
    String? description,
    List<String>? commonNames,
    String? localName,
    String? website,
  }) async {
    try {
      // First create the standalone department
      final department = await createDepartment(
        name: departmentName,
        description: description,
        commonNames: commonNames,
      );

      // Then create the university department link
      final universityDepartment = await createUniversityDepartment(
        universityId: universityId,
        departmentId: department.id,
        localName: localName,
        website: website,
      );

      return universityDepartment;
    } catch (e) {
      rethrow;
    }
  }

  /// Search departments by name
  static Future<List<Department>> searchDepartments(String query) async {
    try {
      final response = await ApiService.get('/departments/?search=${Uri.encodeComponent(query)}');
      return (response as List)
          .map((json) => Department.fromJson(json))
          .toList();
    } catch (e) {
      print('Error searching departments: $e');
      return [];
    }
  }

  /// Get university department by ID
  static Future<UniversityDepartment?> getUniversityDepartmentById(String id) async {
    try {
      final response = await ApiService.get('/university-departments/$id/');
      return UniversityDepartment.fromJson(response);
    } catch (e) {
      print('Error loading university department $id: $e');
      return null;
    }
  }
}
// lib/services/university_department_service.dart
import '../data/models/university_department.dart';
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

  /// Auto-create a new department for a university (using the new API)
  static Future<UniversityDepartment> autoCreateDepartmentForUniversity({
    required String universityId,
    required String departmentName,
    String? description,
    List<String>? commonNames,
    String? localName,
    String? website,
    String? headName,
    int? establishedYear,
  }) async {
    try {
      final requestBody = <String, dynamic>{
        'department_name': departmentName,
      };

      // Add optional fields only if they are provided
      if (description != null && description.isNotEmpty) {
        requestBody['description'] = description;
      }
      if (commonNames != null && commonNames.isNotEmpty) {
        requestBody['common_names'] = commonNames;
      }
      if (localName != null && localName.isNotEmpty) {
        requestBody['local_name'] = localName;
      }
      if (website != null && website.isNotEmpty) {
        requestBody['website'] = website;
      }
      if (headName != null && headName.isNotEmpty) {
        requestBody['head_name'] = headName;
      }
      if (establishedYear != null) {
        requestBody['established_year'] = establishedYear;
      }

      final response = await ApiService.post(
        '/universities/$universityId/departments/',
        requestBody,
        requireAuth: true,
      );

      return UniversityDepartment.fromJson(response);
    } catch (e) {
      rethrow;
    }
  }

  /// Create a new department and link it to a university in one step (Legacy method)
  /// Recommend using autoCreateDepartmentForUniversity instead for better API efficiency
  @Deprecated('Use autoCreateDepartmentForUniversity instead. This method will be removed in a future version.')
  static Future<UniversityDepartment> createNewDepartmentForUniversity({
    required String universityId,
    required String departmentName,
    String? description,
    List<String>? commonNames,
    String? localName,
    String? website,
    String? headName,
    int? establishedYear,
  }) async {
    // Use the new auto-create API instead of the two-step process
    return autoCreateDepartmentForUniversity(
      universityId: universityId,
      departmentName: departmentName,
      description: description,
      commonNames: commonNames,
      localName: localName,
      website: website,
      headName: headName,
      establishedYear: establishedYear,
    );
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

  /// Quick create department with minimal information
  static Future<UniversityDepartment> quickCreateDepartment({
    required String universityId,
    required String departmentName,
    String? localName,
  }) async {
    return autoCreateDepartmentForUniversity(
      universityId: universityId,
      departmentName: departmentName,
      localName: localName,
      description: 'Department of $departmentName', // Auto-generated description
    );
  }

  /// Create department with full details
  static Future<UniversityDepartment> createDepartmentWithDetails({
    required String universityId,
    required String departmentName,
    required String description,
    required String localName,
    required String website,
    required String headName,
    required int establishedYear,
    List<String>? commonNames,
  }) async {
    return autoCreateDepartmentForUniversity(
      universityId: universityId,
      departmentName: departmentName,
      description: description,
      commonNames: commonNames,
      localName: localName,
      website: website,
      headName: headName,
      establishedYear: establishedYear,
    );
  }

  /// Validate department data before creation
  static Map<String, String> validateDepartmentData({
    required String departmentName,
    String? website,
    int? establishedYear,
  }) {
    final errors = <String, String>{};

    if (departmentName.trim().isEmpty) {
      errors['department_name'] = 'Department name is required';
    } else if (departmentName.trim().length < 2) {
      errors['department_name'] = 'Department name must be at least 2 characters';
    }

    if (website != null && website.isNotEmpty) {
      final urlPattern = RegExp(r'^https?:\/\/.+\..+');
      if (!urlPattern.hasMatch(website)) {
        errors['website'] = 'Please enter a valid website URL (starting with http:// or https://)';
      }
    }

    if (establishedYear != null) {
      final currentYear = DateTime.now().year;
      if (establishedYear < 1800 || establishedYear > currentYear) {
        errors['established_year'] = 'Established year must be between 1800 and $currentYear';
      }
    }

    return errors;
  }
}
// lib/services/research_group_service.dart
import '../data/models/research_group.dart';
import 'api_service.dart';
import 'lab_service.dart';

class ResearchGroupService {
  /// Get all research groups with optional filtering
  static Future<List<ResearchGroup>> getResearchGroups({
    String? universityId,
    String? universityDepartmentId,
    String? search,
    String? ordering,
  }) async {
    try {
      String endpoint = '/universities/research-groups/';
      final params = <String>[];

      if (universityId != null) params.add('university=$universityId');
      if (universityDepartmentId != null) params.add('university_department=$universityDepartmentId');
      if (search != null) params.add('search=${Uri.encodeComponent(search)}');
      if (ordering != null) params.add('ordering=${Uri.encodeComponent(ordering)}');

      if (params.isNotEmpty) {
        endpoint += '?${params.join('&')}';
      }

      print('DEBUG: Making API call to: $endpoint');
      final response = await ApiService.get(endpoint);
      print('DEBUG: API response received, processing ${response is Map && response.containsKey('results') ? (response['results'] as List).length : 'unknown count'} research groups');

      List<ResearchGroup> groups;
      if (response is Map && response.containsKey('results')) {
        groups = (response['results'] as List)
            .map((json) => ResearchGroup.fromJson(json))
            .toList();
      } else {
        groups = (response as List)
            .map((json) => ResearchGroup.fromJson(json))
            .toList();
      }

      print('DEBUG: Processed ${groups.length} research groups from API');
      return groups;
    } catch (e) {
      return [];
    }
  }

  /// Get research groups by university
  static Future<List<ResearchGroup>> getGroupsByUniversity(String universityId) async {
    return await getResearchGroups(universityId: universityId);
  }

  /// Get research groups by university department ID
  static Future<List<ResearchGroup>> getGroupsByUniversityDepartment(
    String universityDepartmentId
  ) async {
    return await getResearchGroups(
      universityDepartmentId: universityDepartmentId,
    );
  }

  /// Search research groups
  static Future<List<ResearchGroup>> searchGroups(String query) async {
    return await getResearchGroups(search: query);
  }

  /// Get specific research group by ID
  static Future<ResearchGroup?> getResearchGroupById(String id) async {
    try {
      final response = await ApiService.get('/universities/research-groups/$id/');
      return ResearchGroup.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  /// Create new research group
  static Future<ResearchGroup> createResearchGroup({
    required String name,
    required String description,
    required String universityId,
    required String department,
    List<String>? researchAreas,
    String? website,
  }) async {
    try {
      final groupData = {
        'name': name,
        'description': description,
        'university_id': int.parse(universityId),
        'department': department,
        if (researchAreas != null) 'research_areas': researchAreas,
        if (website != null) 'website': website,
      };

      final response = await ApiService.post(
        '/universities/research-groups/',
        groupData,
        requireAuth: true,
      );
      return ResearchGroup.fromJson(response);
    } catch (e) {
      rethrow;
    }
  }

  /// Get professors in research group
  static Future<List<dynamic>> getProfessorsInGroup(String groupId) async {
    try {
      final response = await ApiService.get('/universities/research-groups/$groupId/professors/');
      return response as List;
    } catch (e) {
      return [];
    }
  }

  /// Get labs in research group
  static Future<List<dynamic>> getLabsInGroup(String groupId) async {
    try {
      final response = await ApiService.get('/universities/research-groups/$groupId/labs/');
      return response as List;
    } catch (e) {
      return [];
    }
  }

  /// Get departments for a specific university
  static Future<List<String>> getDepartmentsByUniversity(String universityId) async {
    try {
      // First try to get departments from research groups
      final groups = await getGroupsByUniversity(universityId);
      final departments = groups.map((group) => group.department).toSet().toList();

      // If no departments from research groups, try to get from labs
      if (departments.isEmpty) {
        final labs = await LabService.getLabsByUniversity(universityId);
        final labDepartments = labs.map((lab) => lab.department).toSet().toList();
        return labDepartments..sort();
      }

      return departments..sort();
    } catch (e) {
      return [];
    }
  }
}
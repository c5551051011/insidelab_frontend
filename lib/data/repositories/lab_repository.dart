// data/repositories/lab_repository.dart
import '../models/lab.dart';
import '../../services/lab_service.dart';

abstract class LabRepository {
  Future<List<Lab>> getFeaturedLabs();
  Future<Lab?> getLabById(String id);
  Future<List<Lab>> searchLabs(String query, Map<String, dynamic>? filters);
  Future<List<Lab>> getLabsByUniversity(String universityId);
  Future<List<Lab>> getLabsByProfessor(String professorId);
  Future<void> updateLabRating(String labId);
}

class LabRepositoryImpl implements LabRepository {
  @override
  Future<List<Lab>> getFeaturedLabs() async {
    try {
      return await LabService.getFeaturedLabs();
    } catch (e) {
      print('Error fetching featured labs: $e');
      return [];
    }
  }

  @override
  Future<Lab?> getLabById(String id) async {
    try {
      return await LabService.getLabById(id);
    } catch (e) {
      print('Error fetching lab by id: $e');
      return null;
    }
  }

  @override
  Future<List<Lab>> searchLabs(String query, Map<String, dynamic>? filters) async {
    try {
      final response = await LabService.searchLabs(
        query: query,
        filters: filters,
      );

      if (response['results'] != null) {
        return (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error searching labs: $e');
      return [];
    }
  }

  @override
  Future<List<Lab>> getLabsByUniversity(String universityId) async {
    try {
      final response = await LabService.searchLabs(
        filters: {'university': universityId},
      );

      if (response['results'] != null) {
        return (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching labs by university: $e');
      return [];
    }
  }

  @override
  Future<List<Lab>> getLabsByProfessor(String professorId) async {
    try {
      final response = await LabService.searchLabs(
        filters: {'professor': professorId},
      );

      if (response['results'] != null) {
        return (response['results'] as List)
            .map((json) => Lab.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error fetching labs by professor: $e');
      return [];
    }
  }

  @override
  Future<void> updateLabRating(String labId) async {
    // This is handled by the backend automatically
  }
}
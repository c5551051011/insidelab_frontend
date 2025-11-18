// services/saved_labs_service.dart
import '../data/models/lab.dart';
import 'api_service.dart';

enum LabInterestType {
  general('general'),
  application('application'),
  watching('watching'),
  recruited('recruited');

  const LabInterestType(this.value);
  final String value;

  static LabInterestType fromString(String value) {
    return LabInterestType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => LabInterestType.general,
    );
  }
}

class LabInterest {
  final int id;
  final int labId;
  final String labName;
  final String labProfessor;
  final String labUniversity;
  final String labDepartment;
  final double labRating;
  final LabInterestType interestType;
  final String? notes;
  final DateTime createdAt;

  LabInterest({
    required this.id,
    required this.labId,
    required this.labName,
    required this.labProfessor,
    required this.labUniversity,
    required this.labDepartment,
    required this.labRating,
    required this.interestType,
    this.notes,
    required this.createdAt,
  });

  factory LabInterest.fromJson(Map<String, dynamic> json) {
    return LabInterest(
      id: json['id'],
      labId: json['lab'],
      labName: json['lab_name'],
      labProfessor: json['lab_professor'],
      labUniversity: json['lab_university'],
      labDepartment: json['lab_department'],
      labRating: double.parse(json['lab_rating'].toString()),
      interestType: LabInterestType.fromString(json['interest_type']),
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class SavedLabsService {
  /// Get all lab interests for the current user
  static Future<List<LabInterest>> getLabInterests() async {
    try {
      final response = await ApiService.get('/auth/lab-interests/', requireAuth: true);

      if (response is List) {
        return response.map((json) => LabInterest.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching lab interests: $e');
      return [];
    }
  }

  /// Get lab interests summary grouped by type
  static Future<Map<String, dynamic>?> getLabInterestsSummary() async {
    try {
      final response = await ApiService.get('/auth/lab-interests/summary/', requireAuth: true);
      return response as Map<String, dynamic>?;
    } catch (e) {
      print('Error fetching lab interests summary: $e');
      return null;
    }
  }

  /// Add or update lab interest
  static Future<LabInterest?> toggleLabInterest(
    String labId, {
    LabInterestType interestType = LabInterestType.general,
    String? notes,
  }) async {
    try {
      final response = await ApiService.post('/auth/lab-interests/toggle_interest/', {
        'lab_id': int.parse(labId),
        'interest_type': interestType.value,
        if (notes != null) 'notes': notes,
      }, requireAuth: true);

      // Handle the response format: {"action": "added", "interest": {...}}
      if (response is Map<String, dynamic> && response.containsKey('interest')) {
        return LabInterest.fromJson(response['interest']);
      }

      // Fallback: try to parse response directly (in case format changes)
      return LabInterest.fromJson(response);
    } catch (e) {
      print('Error toggling lab interest: $e');
      return null;
    }
  }

  /// Remove lab interest
  static Future<bool> removeLabInterest(String labId) async {
    try {
      await ApiService.delete('/auth/lab-interests/remove_interest/?lab_id=$labId', requireAuth: true);
      return true;
    } catch (e) {
      print('Error removing lab interest: $e');
      return false;
    }
  }

  /// Get interested lab IDs for batch checking
  static Future<Set<String>> getInterestedLabIds() async {
    try {
      final interests = await getLabInterests();
      return interests.map((interest) => interest.labId.toString()).toSet();
    } catch (e) {
      print('Error fetching interested lab IDs: $e');
      return <String>{};
    }
  }

  /// Check if a lab has any interest
  static Future<LabInterest?> getLabInterest(String labId) async {
    try {
      final interests = await getLabInterests();
      return interests.where((interest) => interest.labId.toString() == labId).firstOrNull;
    } catch (e) {
      print('Error checking lab interest: $e');
      return null;
    }
  }

  /// Legacy methods for backward compatibility
  @deprecated
  static Future<List<Lab>> getSavedLabs() async {
    try {
      final interests = await getLabInterests();
      // Convert LabInterest to Lab objects for backward compatibility
      // This would need proper Lab model creation from the interest data
      return [];
    } catch (e) {
      print('Error fetching saved labs: $e');
      return [];
    }
  }

  @deprecated
  static Future<bool> saveLab(String labId) async {
    final result = await toggleLabInterest(labId);
    return result != null;
  }

  @deprecated
  static Future<bool> unsaveLab(String labId) async {
    return await removeLabInterest(labId);
  }

  @deprecated
  static Future<bool> isLabSaved(String labId) async {
    final interest = await getLabInterest(labId);
    return interest != null;
  }

  @deprecated
  static Future<Set<String>> getSavedLabIds() async {
    return await getInterestedLabIds();
  }

  @deprecated
  static Future<bool> toggleLabSave(String labId) async {
    final result = await toggleLabInterest(labId);
    return result != null;
  }
}
// lib/data/models/university_department.dart
class Department {
  final String id;
  final String name;
  final String description;
  final List<String> commonNames;

  Department({
    required this.id,
    required this.name,
    this.description = '',
    this.commonNames = const [],
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      commonNames: List<String>.from(json['common_names'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'common_names': commonNames,
    };
  }
}

class UniversityDepartment {
  final String id;
  final String universityId;
  final String universityName;
  final String departmentId;
  final String departmentName;
  final String? localName;
  final String? website;
  final String? headName;
  final int? establishedYear;
  final bool isActive;

  UniversityDepartment({
    required this.id,
    required this.universityId,
    required this.universityName,
    required this.departmentId,
    required this.departmentName,
    this.localName,
    this.website,
    this.headName,
    this.establishedYear,
    this.isActive = true,
  });

  factory UniversityDepartment.fromJson(Map<String, dynamic> json) {
    return UniversityDepartment(
      id: json['id'].toString(),
      universityId: json['university_id']?.toString() ?? json['university']?.toString() ?? '',
      universityName: json['university_name'] ?? json['university']?['name'] ?? '',
      departmentId: json['department_id']?.toString() ?? json['department']?.toString() ?? '',
      departmentName: json['department_name'] ?? json['department']?['name'] ?? '',
      localName: json['local_name'],
      website: json['website'],
      headName: json['head_name'],
      establishedYear: json['established_year'],
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'university_id': universityId,
      'university_name': universityName,
      'department_id': departmentId,
      'department_name': departmentName,
      'local_name': localName,
      'website': website,
      'head_name': headName,
      'established_year': establishedYear,
      'is_active': isActive,
    };
  }

  // Display name for UI
  String get displayName => localName?.isNotEmpty == true ? localName! : departmentName;

  // Full description for dropdowns
  String get fullDescription => '$displayName ($universityName)';

  @override
  String toString() => displayName;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UniversityDepartment && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
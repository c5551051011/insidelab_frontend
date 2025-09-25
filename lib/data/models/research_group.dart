// data/models/research_group.dart
class ResearchGroup {
  final String id;
  final String name;
  final String description;
  final String universityId;
  final String universityName;
  final String department;
  final List<String> researchAreas;
  final int professorCount;
  final int labCount;
  final String? website;
  final DateTime createdAt;
  final DateTime updatedAt;

  ResearchGroup({
    required this.id,
    required this.name,
    required this.description,
    required this.universityId,
    required this.universityName,
    required this.department,
    this.researchAreas = const [],
    this.professorCount = 0,
    this.labCount = 0,
    this.website,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ResearchGroup.fromJson(Map<String, dynamic> json) {
    return ResearchGroup(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      universityId: json['university_id']?.toString() ?? json['universityId']?.toString() ?? '',
      universityName: json['university_name'] ?? json['universityName'] ?? '',
      department: json['department'] ?? '',
      researchAreas: List<String>.from(json['research_areas'] ?? json['researchAreas'] ?? []),
      professorCount: json['professor_count'] ?? json['professorCount'] ?? 0,
      labCount: json['lab_count'] ?? json['labCount'] ?? 0,
      website: json['website'],
      createdAt: DateTime.parse(json['created_at'] ?? json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'university_id': universityId,
      'university_name': universityName,
      'department': department,
      'research_areas': researchAreas,
      'professor_count': professorCount,
      'lab_count': labCount,
      'website': website,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  String get displayName => name;

  String get fullHierarchy => '$universityName > $department > $name';
}
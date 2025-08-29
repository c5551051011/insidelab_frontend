
// data/models/lab.dart
class Lab {
  final String id;
  final String name;
  final String professorName;
  final String professorId;
  final String universityName;
  final String universityId;
  final String department;
  final double overallRating;
  final int reviewCount;
  final List<String> researchAreas;
  final List<String> tags;
  final String? description;
  final String? website;
  final int? labSize;
  final Map<String, double>? ratingBreakdown;

  Lab({
    required this.id,
    required this.name,
    required this.professorName,
    required this.professorId,
    required this.universityName,
    required this.universityId,
    required this.department,
    required this.overallRating,
    required this.reviewCount,
    required this.researchAreas,
    required this.tags,
    this.description,
    this.website,
    this.labSize,
    this.ratingBreakdown,
  });

  factory Lab.fromJson(Map<String, dynamic> json) {
    return Lab(
      id: json['id'],
      name: json['name'],
      professorName: json['professorName'],
      professorId: json['professorId'],
      universityName: json['universityName'],
      universityId: json['universityId'],
      department: json['department'],
      overallRating: json['overallRating'].toDouble(),
      reviewCount: json['reviewCount'],
      researchAreas: List<String>.from(json['researchAreas']),
      tags: List<String>.from(json['tags']),
      description: json['description'],
      website: json['website'],
      labSize: json['labSize'],
      ratingBreakdown: json['ratingBreakdown'] != null
          ? Map<String, double>.from(json['ratingBreakdown'])
          : null,
    );
  }
}


// Lab model update to include toJson
extension LabJson on Lab {
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'professorName': professorName,
      'professorId': professorId,
      'universityName': universityName,
      'universityId': universityId,
      'department': department,
      'overallRating': overallRating,
      'reviewCount': reviewCount,
      'researchAreas': researchAreas,
      'tags': tags,
      'description': description,
      'website': website,
      'labSize': labSize,
      'ratingBreakdown': ratingBreakdown,
    };
  }
}
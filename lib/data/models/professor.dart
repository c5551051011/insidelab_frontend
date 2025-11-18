
// data/models/professor.dart
class Professor {
  final String id;
  final String name;
  final String email;
  final String universityId;
  final String department;
  final String? universityDepartmentId;
  final String? researchGroupId;
  final String? profileUrl;
  final String? googleScholarUrl;
  final String? personalWebsite;
  final List<String> researchInterests;
  final String? bio;

  Professor({
    required this.id,
    required this.name,
    required this.email,
    required this.universityId,
    required this.department,
    this.universityDepartmentId,
    this.researchGroupId,
    this.profileUrl,
    this.googleScholarUrl,
    this.personalWebsite,
    required this.researchInterests,
    this.bio,
  });

  factory Professor.fromJson(Map<String, dynamic> json) {
    return Professor(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      universityId: json['university_id']?.toString() ?? json['university']?.toString() ?? '',
      department: json['department'] ?? '',
      universityDepartmentId: json['university_department']?.toString(),
      researchGroupId: json['research_group']?.toString(),
      profileUrl: json['profile_url'],
      googleScholarUrl: json['google_scholar_url'],
      personalWebsite: json['personal_website'],
      researchInterests: List<String>.from(json['research_interests'] ?? []),
      bio: json['bio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'university_id': universityId,
      'department': department,
      'university_department': universityDepartmentId,
      'research_group': researchGroupId,
      'profile_url': profileUrl,
      'google_scholar_url': googleScholarUrl,
      'personal_website': personalWebsite,
      'research_interests': researchInterests,
      'bio': bio,
    };
  }
}


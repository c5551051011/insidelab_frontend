
// data/models/professor.dart
class Professor {
  final String id;
  final String name;
  final String email;
  final String universityId;
  final String department;
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
    this.profileUrl,
    this.googleScholarUrl,
    this.personalWebsite,
    required this.researchInterests,
    this.bio,
  });

  factory Professor.fromJson(Map<String, dynamic> json) {
    return Professor(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      universityId: json['universityId'],
      department: json['department'],
      profileUrl: json['profileUrl'],
      googleScholarUrl: json['googleScholarUrl'],
      personalWebsite: json['personalWebsite'],
      researchInterests: List<String>.from(json['researchInterests']),
      bio: json['bio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'universityId': universityId,
      'department': department,
      'profileUrl': profileUrl,
      'googleScholarUrl': googleScholarUrl,
      'personalWebsite': personalWebsite,
      'researchInterests': researchInterests,
      'bio': bio,
    };
  }
}
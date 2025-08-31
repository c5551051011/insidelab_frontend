// data/models/university.dart
class University {
  final String id;
  final String name;
  final String country;
  final String state;
  final String city;
  final String? website;
  final int? ranking;
  final String? logoUrl;

  University({
    required this.id,
    required this.name,
    required this.country,
    required this.state,
    required this.city,
    this.website,
    this.ranking,
    this.logoUrl,
  });

  factory University.fromJson(Map<String, dynamic> json) {
    return University(
      id: json['id'],
      name: json['name'],
      country: json['country'],
      state: json['state'],
      city: json['city'],
      website: json['website'],
      ranking: json['ranking'],
      logoUrl: json['logoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'country': country,
      'state': state,
      'city': city,
      'website': website,
      'ranking': ranking,
      'logoUrl': logoUrl,
    };
  }
}

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


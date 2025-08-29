
// data/models/user.dart
class User {
  final String id;
  final String email;
  final String? name;
  final String? universityId;
  final String? department;
  final String? position;
  final bool isVerified;
  final DateTime joinedDate;
  final int reviewCount;
  final int helpfulVotes;

  User({
    required this.id,
    required this.email,
    this.name,
    this.universityId,
    this.department,
    this.position,
    required this.isVerified,
    required this.joinedDate,
    required this.reviewCount,
    required this.helpfulVotes,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      universityId: json['universityId'],
      department: json['department'],
      position: json['position'],
      isVerified: json['isVerified'],
      joinedDate: DateTime.parse(json['joinedDate']),
      reviewCount: json['reviewCount'],
      helpfulVotes: json['helpfulVotes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'universityId': universityId,
      'department': department,
      'position': position,
      'isVerified': isVerified,
      'joinedDate': joinedDate.toIso8601String(),
      'reviewCount': reviewCount,
      'helpfulVotes': helpfulVotes,
    };
  }
}

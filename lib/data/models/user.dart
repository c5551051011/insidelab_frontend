// data/models/user.dart
enum VerificationStatus { unverified, pending, verified }
enum UserRole { seeker, provider, admin }

class User {
  final String id;
  final String email;
  final String? name;
  final String? firstName;
  final String? lastName;
  final String? profilePicture;
  
  // Academic Information
  final String? universityId;
  final String? university;
  final String? department;
  final String? position;
  final String? labName;
  final String? advisorName;
  final String? advisorEmail;
  final String? researchArea;
  final List<String> publications;
  
  // Verification & Roles
  final VerificationStatus verificationStatus;
  final List<UserRole> roles;
  final bool isLabMember;
  final DateTime? verificationDate;
  final String? verificationMethod;
  
  // Activity Stats
  final DateTime joinedDate;
  final int reviewCount;
  final int helpfulVotes;
  
  // Service Provider Info
  final bool isServiceProvider;
  final double? providerRating;
  final int? servicesCompleted;
  final List<String> serviceTypes; // ['mock_interview', 'cv_review', 'mentorship']
  final String? bio;
  final double? hourlyRate;
  final bool isAvailable;
  final List<String> specialties;

  User({
    required this.id,
    required this.email,
    this.name,
    this.firstName,
    this.lastName,
    this.profilePicture,
    this.universityId,
    this.university,
    this.department,
    this.position,
    this.labName,
    this.advisorName,
    this.advisorEmail,
    this.researchArea,
    this.publications = const [],
    this.verificationStatus = VerificationStatus.unverified,
    this.roles = const [UserRole.seeker],
    this.isLabMember = false,
    this.verificationDate,
    this.verificationMethod,
    required this.joinedDate,
    this.reviewCount = 0,
    this.helpfulVotes = 0,
    this.isServiceProvider = false,
    this.providerRating,
    this.servicesCompleted,
    this.serviceTypes = const [],
    this.bio,
    this.hourlyRate,
    this.isAvailable = false,
    this.specialties = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      profilePicture: json['profilePicture'],
      universityId: json['universityId'],
      university: json['university'],
      department: json['department'],
      position: json['position'],
      labName: json['labName'],
      advisorName: json['advisorName'],
      advisorEmail: json['advisorEmail'],
      researchArea: json['researchArea'],
      publications: List<String>.from(json['publications'] ?? []),
      verificationStatus: VerificationStatus.values.firstWhere(
        (e) => e.name == json['verificationStatus'],
        orElse: () => VerificationStatus.unverified,
      ),
      roles: (json['roles'] as List?)?.map((role) => 
        UserRole.values.firstWhere((e) => e.name == role)
      ).toList() ?? [UserRole.seeker],
      isLabMember: json['isLabMember'] ?? false,
      verificationDate: json['verificationDate'] != null 
        ? DateTime.parse(json['verificationDate'])
        : null,
      verificationMethod: json['verificationMethod'],
      joinedDate: DateTime.parse(json['joinedDate']),
      reviewCount: json['reviewCount'] ?? 0,
      helpfulVotes: json['helpfulVotes'] ?? 0,
      isServiceProvider: json['isServiceProvider'] ?? false,
      providerRating: json['providerRating']?.toDouble(),
      servicesCompleted: json['servicesCompleted'],
      serviceTypes: List<String>.from(json['serviceTypes'] ?? []),
      bio: json['bio'],
      hourlyRate: json['hourlyRate']?.toDouble(),
      isAvailable: json['isAvailable'] ?? false,
      specialties: List<String>.from(json['specialties'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'firstName': firstName,
      'lastName': lastName,
      'profilePicture': profilePicture,
      'universityId': universityId,
      'university': university,
      'department': department,
      'position': position,
      'labName': labName,
      'advisorName': advisorName,
      'advisorEmail': advisorEmail,
      'researchArea': researchArea,
      'publications': publications,
      'verificationStatus': verificationStatus.name,
      'roles': roles.map((role) => role.name).toList(),
      'isLabMember': isLabMember,
      'verificationDate': verificationDate?.toIso8601String(),
      'verificationMethod': verificationMethod,
      'joinedDate': joinedDate.toIso8601String(),
      'reviewCount': reviewCount,
      'helpfulVotes': helpfulVotes,
      'isServiceProvider': isServiceProvider,
      'providerRating': providerRating,
      'servicesCompleted': servicesCompleted,
      'serviceTypes': serviceTypes,
      'bio': bio,
      'hourlyRate': hourlyRate,
      'isAvailable': isAvailable,
      'specialties': specialties,
    };
  }

  // Helper methods for dual-role functionality
  bool get isVerified => verificationStatus == VerificationStatus.verified;
  bool get canProvideServices => isVerified && isLabMember;
  bool hasRole(UserRole role) => roles.contains(role);
  
  String get displayName => name ?? '$firstName $lastName'.trim();
  String get verificationBadge {
    switch (verificationStatus) {
      case VerificationStatus.verified:
        return isLabMember ? 'Verified Lab Member' : 'Verified User';
      case VerificationStatus.pending:
        return 'Verification Pending';
      case VerificationStatus.unverified:
        return 'Unverified';
    }
  }
}

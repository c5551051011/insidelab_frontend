class Mentor {
  final String id;
  final String userId;
  final String name;
  final String university;
  final String department;
  final String degree;
  final String field;
  final int yearInProgram;
  final String profileImageUrl;
  final String bio;
  final List<String> expertise;
  final List<String> languages;
  final Map<String, double> serviceRates; // service_type -> hourly_rate
  final double rating;
  final int totalSessions;
  final List<String> availableServices;
  final Map<String, List<String>> availability; // day -> time_slots
  final bool isVerified;
  final bool isActive;
  final DateTime joinedDate;

  Mentor({
    required this.id,
    required this.userId,
    required this.name,
    required this.university,
    required this.department,
    required this.degree,
    required this.field,
    required this.yearInProgram,
    required this.profileImageUrl,
    required this.bio,
    required this.expertise,
    required this.languages,
    required this.serviceRates,
    required this.rating,
    required this.totalSessions,
    required this.availableServices,
    required this.availability,
    required this.isVerified,
    required this.isActive,
    required this.joinedDate,
  });

  factory Mentor.fromJson(Map<String, dynamic> json) {
    return Mentor(
      id: json['id'],
      userId: json['user_id'],
      name: json['name'],
      university: json['university'],
      department: json['department'],
      degree: json['degree'],
      field: json['field'],
      yearInProgram: json['year_in_program'],
      profileImageUrl: json['profile_image_url'] ?? '',
      bio: json['bio'],
      expertise: List<String>.from(json['expertise']),
      languages: List<String>.from(json['languages']),
      serviceRates: Map<String, double>.from(json['service_rates']),
      rating: json['rating'].toDouble(),
      totalSessions: json['total_sessions'],
      availableServices: List<String>.from(json['available_services']),
      availability: Map<String, List<String>>.from(
        json['availability'].map((key, value) => MapEntry(key, List<String>.from(value)))
      ),
      isVerified: json['is_verified'],
      isActive: json['is_active'],
      joinedDate: DateTime.parse(json['joined_date']),
    );
  }
}
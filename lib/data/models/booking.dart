class Booking {
  final String id;
  final String userId;
  final String mentorId;
  final String serviceType;
  final DateTime scheduledDate;
  final String timeSlot;
  final double price;
  final String status; // pending, confirmed, completed, cancelled
  final String? notes;
  final Map<String, dynamic>? serviceDetails;
  final DateTime createdAt;
  final DateTime? completedAt;

  Booking({
    required this.id,
    required this.userId,
    required this.mentorId,
    required this.serviceType,
    required this.scheduledDate,
    required this.timeSlot,
    required this.price,
    required this.status,
    this.notes,
    this.serviceDetails,
    required this.createdAt,
    this.completedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      userId: json['user_id'],
      mentorId: json['mentor_id'],
      serviceType: json['service_type'],
      scheduledDate: DateTime.parse(json['scheduled_date']),
      timeSlot: json['time_slot'],
      price: json['price'].toDouble(),
      status: json['status'],
      notes: json['notes'],
      serviceDetails: json['service_details'],
      createdAt: DateTime.parse(json['created_at']),
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
    );
  }
}

class ApplicationDeadline {
  final String id;
  final String userId;
  final String universityName;
  final String programName;
  final DateTime deadline;
  final String status; // not_started, in_progress, submitted
  final List<String> requirements;
  final Map<String, bool> completedRequirements;
  final String? notes;

  ApplicationDeadline({
    required this.id,
    required this.userId,
    required this.universityName,
    required this.programName,
    required this.deadline,
    required this.status,
    required this.requirements,
    required this.completedRequirements,
    this.notes,
  });

  factory ApplicationDeadline.fromJson(Map<String, dynamic> json) {
    return ApplicationDeadline(
      id: json['id'],
      userId: json['user_id'],
      universityName: json['university_name'],
      programName: json['program_name'],
      deadline: DateTime.parse(json['deadline']),
      status: json['status'],
      requirements: List<String>.from(json['requirements']),
      completedRequirements: Map<String, bool>.from(json['completed_requirements']),
      notes: json['notes'],
    );
  }
}
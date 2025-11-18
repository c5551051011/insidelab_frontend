// data/models/saved_lab.dart
class SavedLab {
  final String id;
  final String labId;
  final String labName;
  final String universityName;
  final String professorName;
  final String? notes;
  final DateTime savedDate;
  final bool isApplied;
  final String? applicationStatus;
  final DateTime? applicationDeadline;

  SavedLab({
    required this.id,
    required this.labId,
    required this.labName,
    required this.universityName,
    required this.professorName,
    this.notes,
    required this.savedDate,
    this.isApplied = false,
    this.applicationStatus,
    this.applicationDeadline,
  });

  factory SavedLab.fromJson(Map<String, dynamic> json) {
    return SavedLab(
      id: json['id'],
      labId: json['labId'],
      labName: json['labName'],
      universityName: json['universityName'],
      professorName: json['professorName'],
      notes: json['notes'],
      savedDate: DateTime.parse(json['savedDate']),
      isApplied: json['isApplied'] ?? false,
      applicationStatus: json['applicationStatus'],
      applicationDeadline: json['applicationDeadline'] != null
          ? DateTime.parse(json['applicationDeadline'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'labId': labId,
      'labName': labName,
      'universityName': universityName,
      'professorName': professorName,
      'notes': notes,
      'savedDate': savedDate.toIso8601String(),
      'isApplied': isApplied,
      'applicationStatus': applicationStatus,
      'applicationDeadline': applicationDeadline?.toIso8601String(),
    };
  }

  SavedLab copyWith({
    String? notes,
    bool? isApplied,
    String? applicationStatus,
    DateTime? applicationDeadline,
  }) {
    return SavedLab(
      id: id,
      labId: labId,
      labName: labName,
      universityName: universityName,
      professorName: professorName,
      notes: notes ?? this.notes,
      savedDate: savedDate,
      isApplied: isApplied ?? this.isApplied,
      applicationStatus: applicationStatus ?? this.applicationStatus,
      applicationDeadline: applicationDeadline ?? this.applicationDeadline,
    );
  }
}
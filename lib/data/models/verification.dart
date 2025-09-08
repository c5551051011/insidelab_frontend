// data/models/verification.dart
import '../models/user.dart';

enum VerificationMethod { 
  universityEmail, 
  advisorConfirmation, 
  labWebsiteListing, 
  publicationVerification,
  manualReview 
}

enum VerificationDocumentType {
  studentId,
  acceptanceLetter,
  advisorEmail,
  publicationProof,
  labWebsiteScreenshot,
  transcripts
}

class VerificationRequest {
  final String id;
  final String userId;
  final VerificationMethod method;
  final Map<String, dynamic> data;
  final List<VerificationDocument> documents;
  final VerificationStatus status;
  final DateTime submittedDate;
  final DateTime? reviewedDate;
  final String? reviewerNotes;
  final String? rejectionReason;

  VerificationRequest({
    required this.id,
    required this.userId,
    required this.method,
    required this.data,
    required this.documents,
    required this.status,
    required this.submittedDate,
    this.reviewedDate,
    this.reviewerNotes,
    this.rejectionReason,
  });

  factory VerificationRequest.fromJson(Map<String, dynamic> json) {
    return VerificationRequest(
      id: json['id'],
      userId: json['userId'],
      method: VerificationMethod.values.firstWhere(
        (e) => e.name == json['method']
      ),
      data: Map<String, dynamic>.from(json['data']),
      documents: (json['documents'] as List)
          .map((doc) => VerificationDocument.fromJson(doc))
          .toList(),
      status: VerificationStatus.values.firstWhere(
        (e) => e.name == json['status']
      ),
      submittedDate: DateTime.parse(json['submittedDate']),
      reviewedDate: json['reviewedDate'] != null 
        ? DateTime.parse(json['reviewedDate'])
        : null,
      reviewerNotes: json['reviewerNotes'],
      rejectionReason: json['rejectionReason'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'method': method.name,
      'data': data,
      'documents': documents.map((doc) => doc.toJson()).toList(),
      'status': status.name,
      'submittedDate': submittedDate.toIso8601String(),
      'reviewedDate': reviewedDate?.toIso8601String(),
      'reviewerNotes': reviewerNotes,
      'rejectionReason': rejectionReason,
    };
  }
}

class VerificationDocument {
  final String id;
  final VerificationDocumentType type;
  final String fileName;
  final String filePath;
  final String? description;
  final DateTime uploadedDate;

  VerificationDocument({
    required this.id,
    required this.type,
    required this.fileName,
    required this.filePath,
    this.description,
    required this.uploadedDate,
  });

  factory VerificationDocument.fromJson(Map<String, dynamic> json) {
    return VerificationDocument(
      id: json['id'],
      type: VerificationDocumentType.values.firstWhere(
        (e) => e.name == json['type']
      ),
      fileName: json['fileName'],
      filePath: json['filePath'],
      description: json['description'],
      uploadedDate: DateTime.parse(json['uploadedDate']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'fileName': fileName,
      'filePath': filePath,
      'description': description,
      'uploadedDate': uploadedDate.toIso8601String(),
    };
  }
}

// Lab affiliation verification data structures
class LabAffiliationData {
  final String university;
  final String department;
  final String labName;
  final String advisorName;
  final String advisorEmail;
  final String position; // PhD student, MS student, postdoc, etc.
  final String? researchArea;
  final int? startYear;
  final List<String>? publications;

  LabAffiliationData({
    required this.university,
    required this.department,
    required this.labName,
    required this.advisorName,
    required this.advisorEmail,
    required this.position,
    this.researchArea,
    this.startYear,
    this.publications,
  });

  factory LabAffiliationData.fromJson(Map<String, dynamic> json) {
    return LabAffiliationData(
      university: json['university'],
      department: json['department'],
      labName: json['labName'],
      advisorName: json['advisorName'],
      advisorEmail: json['advisorEmail'],
      position: json['position'],
      researchArea: json['researchArea'],
      startYear: json['startYear'],
      publications: json['publications'] != null 
        ? List<String>.from(json['publications'])
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'university': university,
      'department': department,
      'labName': labName,
      'advisorName': advisorName,
      'advisorEmail': advisorEmail,
      'position': position,
      'researchArea': researchArea,
      'startYear': startYear,
      'publications': publications,
    };
  }
}
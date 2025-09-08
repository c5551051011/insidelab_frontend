// services/verification_service.dart
import 'dart:io';
import '../data/models/user.dart';
import '../data/models/verification.dart';

class VerificationService {
  static final VerificationService _instance = VerificationService._internal();
  factory VerificationService() => _instance;
  VerificationService._internal();

  // Submit verification request
  Future<VerificationRequest> submitVerificationRequest({
    required String userId,
    required VerificationMethod method,
    required LabAffiliationData labData,
    required List<File> documents,
  }) async {
    try {
      // Upload documents
      final uploadedDocs = await _uploadDocuments(documents);
      
      // Create verification request
      final request = VerificationRequest(
        id: _generateId(),
        userId: userId,
        method: method,
        data: labData.toJson(),
        documents: uploadedDocs,
        status: VerificationStatus.pending,
        submittedDate: DateTime.now(),
      );

      // Submit to backend
      await _submitToBackend(request);
      
      // Send notification emails if advisor email provided
      if (method == VerificationMethod.advisorConfirmation) {
        await _sendAdvisorConfirmationEmail(labData.advisorEmail, request);
      }

      return request;
    } catch (e) {
      throw Exception('Failed to submit verification request: $e');
    }
  }

  // Check if university email is valid
  Future<bool> validateUniversityEmail(String email) async {
    final universityDomains = await _getUniversityDomains();
    final domain = email.split('@').last.toLowerCase();
    return universityDomains.contains(domain);
  }

  // Verify advisor email exists
  Future<bool> verifyAdvisorEmail(String advisorEmail) async {
    try {
      // This would check against academic databases or university directories
      // For now, just validate email format and domain
      final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
      if (!emailRegex.hasMatch(advisorEmail)) return false;
      
      final domain = advisorEmail.split('@').last.toLowerCase();
      final universityDomains = await _getUniversityDomains();
      return universityDomains.contains(domain);
    } catch (e) {
      return false;
    }
  }

  // Check publication authenticity
  Future<bool> verifyPublications(List<String> publications) async {
    try {
      // This would integrate with academic databases like:
      // - Google Scholar API
      // - PubMed API
      // - arXiv API
      // - CrossRef API
      
      for (final publication in publications) {
        // For now, just check if it looks like a valid citation
        if (publication.trim().length < 10) return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get verification status
  Future<VerificationRequest?> getVerificationStatus(String userId) async {
    try {
      // This would fetch from backend
      // For now, return mock data
      return null;
    } catch (e) {
      return null;
    }
  }

  // Get all verification requests (admin)
  Future<List<VerificationRequest>> getPendingVerifications() async {
    try {
      // This would fetch from backend for admin review
      return [];
    } catch (e) {
      return [];
    }
  }

  // Approve verification request
  Future<bool> approveVerification(
    String requestId, 
    String reviewerNotes
  ) async {
    try {
      // Update verification status in backend
      // Update user's verification status
      // Send approval email to user
      return true;
    } catch (e) {
      return false;
    }
  }

  // Reject verification request
  Future<bool> rejectVerification(
    String requestId, 
    String reason,
    String reviewerNotes
  ) async {
    try {
      // Update verification status in backend
      // Send rejection email with feedback
      return true;
    } catch (e) {
      return false;
    }
  }

  // Private helper methods
  Future<List<VerificationDocument>> _uploadDocuments(List<File> files) async {
    final List<VerificationDocument> documents = [];
    
    for (int i = 0; i < files.length; i++) {
      final file = files[i];
      final fileName = file.path.split('/').last;
      
      // Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
      final filePath = await _uploadToCloudStorage(file);
      
      documents.add(VerificationDocument(
        id: _generateId(),
        type: _determineDocumentType(fileName),
        fileName: fileName,
        filePath: filePath,
        uploadedDate: DateTime.now(),
      ));
    }
    
    return documents;
  }

  Future<String> _uploadToCloudStorage(File file) async {
    // Mock upload - replace with actual cloud storage integration
    await Future.delayed(const Duration(seconds: 1));
    return 'https://storage.example.com/documents/${file.path.split('/').last}';
  }

  VerificationDocumentType _determineDocumentType(String fileName) {
    final lowerName = fileName.toLowerCase();
    if (lowerName.contains('student_id') || lowerName.contains('id_card')) {
      return VerificationDocumentType.studentId;
    } else if (lowerName.contains('acceptance') || lowerName.contains('admit')) {
      return VerificationDocumentType.acceptanceLetter;
    } else if (lowerName.contains('transcript')) {
      return VerificationDocumentType.transcripts;
    } else if (lowerName.contains('publication')) {
      return VerificationDocumentType.publicationProof;
    } else {
      return VerificationDocumentType.studentId; // default
    }
  }

  Future<void> _submitToBackend(VerificationRequest request) async {
    // Submit to backend API
    await Future.delayed(const Duration(seconds: 2)); // Mock API call
  }

  Future<void> _sendAdvisorConfirmationEmail(
    String advisorEmail, 
    VerificationRequest request
  ) async {
    // Send email to advisor for confirmation
    // Include link to confirm student affiliation
    await Future.delayed(const Duration(milliseconds: 500)); // Mock email send
  }

  Future<List<String>> _getUniversityDomains() async {
    // This would be loaded from a comprehensive database
    return [
      'edu', 'ac.uk', 'ac.jp', 'ac.kr', 'edu.au', 'edu.sg',
      'mit.edu', 'stanford.edu', 'harvard.edu', 'berkeley.edu',
      'caltech.edu', 'princeton.edu', 'yale.edu', 'columbia.edu',
      'uchicago.edu', 'upenn.edu', 'cornell.edu', 'dartmouth.edu',
      // Add more university domains
    ];
  }

  String _generateId() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }

  // Verification step validation
  Map<String, bool> validateVerificationData(LabAffiliationData data) {
    return {
      'university': data.university.trim().isNotEmpty,
      'department': data.department.trim().isNotEmpty,
      'labName': data.labName.trim().isNotEmpty,
      'advisorName': data.advisorName.trim().isNotEmpty,
      'advisorEmail': RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(data.advisorEmail),
      'position': data.position.trim().isNotEmpty,
    };
  }

  // Get verification requirements by method
  List<VerificationDocumentType> getRequiredDocuments(VerificationMethod method) {
    switch (method) {
      case VerificationMethod.universityEmail:
        return [VerificationDocumentType.studentId];
      case VerificationMethod.advisorConfirmation:
        return [VerificationDocumentType.studentId, VerificationDocumentType.acceptanceLetter];
      case VerificationMethod.labWebsiteListing:
        return [VerificationDocumentType.labWebsiteScreenshot];
      case VerificationMethod.publicationVerification:
        return [VerificationDocumentType.publicationProof];
      case VerificationMethod.manualReview:
        return [
          VerificationDocumentType.studentId,
          VerificationDocumentType.acceptanceLetter,
          VerificationDocumentType.transcripts
        ];
    }
  }
}
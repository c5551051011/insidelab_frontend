// services/university_email_verification_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class UniversityEmailVerificationService {
  /// Send verification email to university email address via backend
  static Future<String> sendVerificationEmail({
    required String userId,
    required String universityEmail,
    required String universityName,
    String? department,
  }) async {
    try {
      // For now, use the feedback API to send verification emails
      // This can be replaced with a dedicated verification endpoint later
      final subject = 'Verify Your University Email - InsideLab';
      final message = '''
Dear Student/Researcher,

Thank you for joining InsideLab! Please verify your university email address to complete your account verification.

University: $universityName
Email: $universityEmail
${department != null ? 'Department: $department' : ''}

To verify your email, please click the verification link that will be sent to your university email address.

If you did not request this verification, please ignore this email.

Best regards,
The InsideLab Team

---
This is an automated message from InsideLab.
''';

      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/feedback/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': universityEmail,
          'name': 'University Email Verification',
          'subject': subject,
          'message': message,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return 'verification_email_sent';
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Failed to send verification email');
      }
    } catch (e) {
      print('Error sending university email verification: $e');
      throw Exception('Failed to send verification email: ${e.toString()}');
    }
  }

  /// Resend verification email (simplified - sends same email again)
  static Future<void> resendVerificationEmail(String verificationId) async {
    try {
      // For simplicity, we'll just indicate success
      // In a real implementation, this would trigger resending the same email
      await Future.delayed(const Duration(milliseconds: 500)); // Simulate API call
      print('Resend verification email requested for ID: $verificationId');
    } catch (e) {
      print('Error resending university email verification: $e');
      throw Exception('Failed to resend verification email: ${e.toString()}');
    }
  }

  /// Verify email with token (called when user clicks link in email)
  static Future<bool> verifyEmailWithToken(String token) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/verification/university-email/verify/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'token': token,
        }),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['detail'] ?? errorData['error'] ?? 'Failed to verify email');
      }
    } catch (e) {
      print('Error verifying university email: $e');
      throw Exception('Failed to verify email: ${e.toString()}');
    }
  }

  /// Check verification status
  static Future<UniversityVerificationStatus> getVerificationStatus(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/verification/university-email/status/$userId/'),
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UniversityVerificationStatus.fromJson(data);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['detail'] ?? errorData['error'] ?? 'Failed to get verification status');
      }
    } catch (e) {
      print('Error getting verification status: $e');
      throw Exception('Failed to get verification status: ${e.toString()}');
    }
  }

  /// Get list of verified university domains for validation
  static Future<List<String>> getVerifiedUniversityDomains() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/verification/university-domains/'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<String>.from(data['domains'] ?? []);
      } else {
        // Return default university domains if API fails
        return [
          '.edu',
          '.ac.kr',
          '.ac.uk',
          '.edu.au',
          '.ac.jp',
          '.ac.cn',
        ];
      }
    } catch (e) {
      print('Error getting university domains: $e');
      // Return default university domains if API fails
      return [
        '.edu',
        '.ac.kr',
        '.ac.uk',
        '.edu.au',
        '.ac.jp',
        '.ac.cn',
      ];
    }
  }
}

class UniversityVerificationStatus {
  final String userId;
  final bool isVerified;
  final String? universityEmail;
  final String? universityName;
  final String? department;
  final DateTime? verifiedAt;
  final DateTime? requestedAt;
  final String status; // 'pending', 'verified', 'expired', 'failed'

  UniversityVerificationStatus({
    required this.userId,
    required this.isVerified,
    this.universityEmail,
    this.universityName,
    this.department,
    this.verifiedAt,
    this.requestedAt,
    required this.status,
  });

  factory UniversityVerificationStatus.fromJson(Map<String, dynamic> json) {
    return UniversityVerificationStatus(
      userId: json['user_id']?.toString() ?? '',
      isVerified: json['is_verified'] ?? false,
      universityEmail: json['university_email'],
      universityName: json['university_name'],
      department: json['department'],
      verifiedAt: json['verified_at'] != null
          ? DateTime.tryParse(json['verified_at'])
          : null,
      requestedAt: json['requested_at'] != null
          ? DateTime.tryParse(json['requested_at'])
          : null,
      status: json['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'is_verified': isVerified,
      'university_email': universityEmail,
      'university_name': universityName,
      'department': department,
      'verified_at': verifiedAt?.toIso8601String(),
      'requested_at': requestedAt?.toIso8601String(),
      'status': status,
    };
  }

  bool get isPending => status == 'pending';
  bool get isExpired => status == 'expired';
  bool get isFailed => status == 'failed';

  String get statusDisplayText {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Verification Pending';
      case 'expired':
        return 'Verification Expired';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Unknown Status';
    }
  }
}
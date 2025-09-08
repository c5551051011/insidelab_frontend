// data/models/booking.dart
import 'service.dart';

enum BookingStatus {
  pending,
  confirmed,
  inProgress,
  completed,
  cancelled,
  disputed,
}

enum PaymentStatus {
  pending,
  authorized,
  captured,
  refunded,
  failed,
}

class Booking {
  final String id;
  final String serviceId;
  final String providerId;
  final String clientId;
  final String? packageId;
  final BookingStatus status;
  final PaymentStatus paymentStatus;
  final double totalAmount;
  final String currency;
  final DateTime? scheduledDateTime; // For live sessions
  final String? sessionLink; // Video call link
  final BookingRequirements requirements;
  final List<BookingMessage> messages;
  final List<BookingDeliverable> deliverables;
  final BookingReview? review;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;
  final String? cancellationReason;
  final BookingPayment payment;

  Booking({
    required this.id,
    required this.serviceId,
    required this.providerId,
    required this.clientId,
    this.packageId,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    this.currency = 'USD',
    this.scheduledDateTime,
    this.sessionLink,
    required this.requirements,
    this.messages = const [],
    this.deliverables = const [],
    this.review,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
    this.cancellationReason,
    required this.payment,
  });

  String get formattedAmount => '\$${totalAmount.toStringAsFixed(2)}';
  
  bool get canCancel => 
    status == BookingStatus.pending || status == BookingStatus.confirmed;
  
  bool get canReview => 
    status == BookingStatus.completed && review == null;
  
  bool get isUpcoming => 
    scheduledDateTime != null && 
    scheduledDateTime!.isAfter(DateTime.now()) &&
    (status == BookingStatus.confirmed || status == BookingStatus.inProgress);
  
  bool get requiresAction => 
    status == BookingStatus.pending || 
    (status == BookingStatus.inProgress && deliverables.isEmpty);

  String get statusDisplayName {
    switch (status) {
      case BookingStatus.pending:
        return 'Pending Confirmation';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.inProgress:
        return 'In Progress';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.disputed:
        return 'Disputed';
    }
  }

  Duration? get timeUntilSession {
    if (scheduledDateTime == null) return null;
    return scheduledDateTime!.difference(DateTime.now());
  }
}

class BookingRequirements {
  final String? resume; // File path or URL
  final String? coverLetter;
  final String? jobDescription;
  final String? personalStatement;
  final List<String> additionalFiles;
  final Map<String, String> customRequirements;
  final String? specialInstructions;

  BookingRequirements({
    this.resume,
    this.coverLetter,
    this.jobDescription,
    this.personalStatement,
    this.additionalFiles = const [],
    this.customRequirements = const {},
    this.specialInstructions,
  });

  bool get hasFiles => 
    resume != null || 
    coverLetter != null || 
    jobDescription != null || 
    personalStatement != null || 
    additionalFiles.isNotEmpty;

  int get totalFiles {
    int count = 0;
    if (resume != null) count++;
    if (coverLetter != null) count++;
    if (jobDescription != null) count++;
    if (personalStatement != null) count++;
    count += additionalFiles.length;
    return count;
  }
}

class BookingMessage {
  final String id;
  final String senderId;
  final String message;
  final List<String> attachments;
  final DateTime timestamp;
  final bool isFromProvider;

  BookingMessage({
    required this.id,
    required this.senderId,
    required this.message,
    this.attachments = const [],
    required this.timestamp,
    required this.isFromProvider,
  });
}

class BookingDeliverable {
  final String id;
  final String title;
  final String? description;
  final String fileUrl;
  final String fileType;
  final int fileSizeBytes;
  final DateTime deliveredAt;
  final int version;

  BookingDeliverable({
    required this.id,
    required this.title,
    this.description,
    required this.fileUrl,
    required this.fileType,
    required this.fileSizeBytes,
    required this.deliveredAt,
    this.version = 1,
  });

  String get formattedFileSize {
    if (fileSizeBytes < 1024) return '${fileSizeBytes} B';
    if (fileSizeBytes < 1024 * 1024) return '${(fileSizeBytes / 1024).toStringAsFixed(1)} KB';
    return '${(fileSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}

class BookingReview {
  final String id;
  final double rating;
  final String? comment;
  final List<String> tags;
  final DateTime createdAt;
  final bool wouldRecommend;

  BookingReview({
    required this.id,
    required this.rating,
    this.comment,
    this.tags = const [],
    required this.createdAt,
    this.wouldRecommend = true,
  });
}

class BookingPayment {
  final String transactionId;
  final String paymentMethod;
  final double subtotal;
  final double platformFee;
  final double processingFee;
  final double total;
  final String currency;
  final DateTime? authorizedAt;
  final DateTime? capturedAt;
  final DateTime? refundedAt;
  final double? refundedAmount;

  BookingPayment({
    required this.transactionId,
    required this.paymentMethod,
    required this.subtotal,
    required this.platformFee,
    required this.processingFee,
    required this.total,
    this.currency = 'USD',
    this.authorizedAt,
    this.capturedAt,
    this.refundedAt,
    this.refundedAmount,
  });

  String get formattedSubtotal => '\$${subtotal.toStringAsFixed(2)}';
  String get formattedPlatformFee => '\$${platformFee.toStringAsFixed(2)}';
  String get formattedProcessingFee => '\$${processingFee.toStringAsFixed(2)}';
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';
}

class BookingRequest {
  final String serviceId;
  final String? packageId;
  final DateTime? preferredDateTime;
  final List<DateTime>? alternativeDateTime;
  final BookingRequirements requirements;
  final String? message;

  BookingRequest({
    required this.serviceId,
    this.packageId,
    this.preferredDateTime,
    this.alternativeDateTime,
    required this.requirements,
    this.message,
  });
}

// Legacy models for backward compatibility
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
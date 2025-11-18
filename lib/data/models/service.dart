// data/models/service.dart
import 'package:flutter/material.dart';

enum ServiceType {
  mockInterview,
  cvReview,
  sopEditing,
  mentorship,
  researchGuidance,
  applicationReview,
  custom,
}

enum ServiceStatus {
  active,
  paused,
  draft,
  archived,
}

enum SessionDuration {
  thirtyMinutes,
  sixtyMinutes,
  ninetyMinutes,
  twoHours,
}

enum DeliveryTime {
  oneDay,
  threeDays,
  oneWeek,
  twoWeeks,
  custom,
}

class Service {
  final String id;
  final String providerId;
  final String title;
  final String description;
  final ServiceType type;
  final ServiceStatus status;
  final double basePrice;
  final String currency;
  final List<String> tags;
  final int maxConcurrentBookings;
  final SessionDuration? sessionDuration; // For live sessions
  final DeliveryTime? deliveryTime; // For async services
  final List<String> requirements;
  final List<ServicePackage> packages;
  final ServiceAvailability availability;
  final ServiceStats stats;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> sampleWork; // URLs to portfolio items
  final String? videoIntroUrl;
  final List<ServiceFAQ> faqs;

  Service({
    required this.id,
    required this.providerId,
    required this.title,
    required this.description,
    required this.type,
    required this.status,
    required this.basePrice,
    this.currency = 'USD',
    required this.tags,
    this.maxConcurrentBookings = 5,
    this.sessionDuration,
    this.deliveryTime,
    this.requirements = const [],
    this.packages = const [],
    required this.availability,
    required this.stats,
    required this.createdAt,
    required this.updatedAt,
    this.sampleWork = const [],
    this.videoIntroUrl,
    this.faqs = const [],
  });

  String get formattedPrice => '\$${basePrice.toStringAsFixed(0)}';
  
  String get typeDisplayName {
    switch (type) {
      case ServiceType.mockInterview:
        return 'Mock Interview';
      case ServiceType.cvReview:
        return 'CV Review';
      case ServiceType.sopEditing:
        return 'SOP Editing';
      case ServiceType.mentorship:
        return 'Mentorship';
      case ServiceType.researchGuidance:
        return 'Research Guidance';
      case ServiceType.applicationReview:
        return 'Application Review';
      case ServiceType.custom:
        return 'Custom Service';
    }
  }

  IconData get typeIcon {
    switch (type) {
      case ServiceType.mockInterview:
        return Icons.mic;
      case ServiceType.cvReview:
        return Icons.description;
      case ServiceType.sopEditing:
        return Icons.edit;
      case ServiceType.mentorship:
        return Icons.people;
      case ServiceType.researchGuidance:
        return Icons.science;
      case ServiceType.applicationReview:
        return Icons.assignment_turned_in;
      case ServiceType.custom:
        return Icons.build;
    }
  }

  bool get isLiveSession => sessionDuration != null;
  bool get isAsyncService => deliveryTime != null;
}

class ServicePackage {
  final String id;
  final String name;
  final String description;
  final double price;
  final Map<String, dynamic> features;
  final SessionDuration? duration;
  final int? revisions;
  final DeliveryTime? deliveryTime;

  ServicePackage({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.features,
    this.duration,
    this.revisions,
    this.deliveryTime,
  });

  String get formattedPrice => '\$${price.toStringAsFixed(0)}';
}

class ServiceAvailability {
  final Map<String, List<TimeSlot>> weeklySlots; // 'monday', 'tuesday', etc.
  final List<DateTime> blockedDates;
  final String timezone;
  final int advanceBookingDays;
  final int minNoticeHours;

  ServiceAvailability({
    required this.weeklySlots,
    this.blockedDates = const [],
    required this.timezone,
    this.advanceBookingDays = 30,
    this.minNoticeHours = 24,
  });

  bool isAvailable(DateTime dateTime) {
    // Check if date is blocked
    if (blockedDates.any((date) => 
        date.year == dateTime.year && 
        date.month == dateTime.month && 
        date.day == dateTime.day)) {
      return false;
    }

    // Check if day has available slots
    final dayName = _getDayName(dateTime.weekday);
    final daySlots = weeklySlots[dayName];
    if (daySlots == null || daySlots.isEmpty) return false;

    // Check if time falls within any slot
    final time = TimeOfDay.fromDateTime(dateTime);
    return daySlots.any((slot) => slot.contains(time));
  }

  String _getDayName(int weekday) {
    switch (weekday) {
      case 1: return 'monday';
      case 2: return 'tuesday';
      case 3: return 'wednesday';
      case 4: return 'thursday';
      case 5: return 'friday';
      case 6: return 'saturday';
      case 7: return 'sunday';
      default: return 'monday';
    }
  }
}

class TimeSlot {
  final TimeOfDay startTime;
  final TimeOfDay endTime;

  TimeSlot({
    required this.startTime,
    required this.endTime,
  });

  bool contains(TimeOfDay time) {
    final startMinutes = startTime.hour * 60 + startTime.minute;
    final endMinutes = endTime.hour * 60 + endTime.minute;
    final timeMinutes = time.hour * 60 + time.minute;
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  String get formatted {
    String formatTime(TimeOfDay time) {
      final hour = time.hour == 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
      final minute = time.minute.toString().padLeft(2, '0');
      final period = time.hour < 12 ? 'AM' : 'PM';
      return '$hour:$minute $period';
    }
    return '${formatTime(startTime)} - ${formatTime(endTime)}';
  }
}

class ServiceStats {
  final double averageRating;
  final int totalReviews;
  final int completedOrders;
  final int responseTimeMinutes;
  final double completionRate;
  final int repeatCustomers;

  ServiceStats({
    this.averageRating = 0.0,
    this.totalReviews = 0,
    this.completedOrders = 0,
    this.responseTimeMinutes = 60,
    this.completionRate = 100.0,
    this.repeatCustomers = 0,
  });

  String get formattedRating => averageRating.toStringAsFixed(1);
  String get responseTimeFormatted {
    if (responseTimeMinutes < 60) {
      return '${responseTimeMinutes}m';
    } else {
      final hours = responseTimeMinutes ~/ 60;
      return '${hours}h';
    }
  }
}

class ServiceFAQ {
  final String question;
  final String answer;

  ServiceFAQ({
    required this.question,
    required this.answer,
  });
}

class ServiceFilter {
  final Set<ServiceType> types;
  final double? minPrice;
  final double? maxPrice;
  final double? minRating;
  final Set<String> tags;
  final bool onlyAvailableNow;
  final SessionDuration? preferredDuration;
  final String? searchQuery;

  ServiceFilter({
    this.types = const {},
    this.minPrice,
    this.maxPrice,
    this.minRating,
    this.tags = const {},
    this.onlyAvailableNow = false,
    this.preferredDuration,
    this.searchQuery,
  });

  ServiceFilter copyWith({
    Set<ServiceType>? types,
    double? minPrice,
    double? maxPrice,
    double? minRating,
    Set<String>? tags,
    bool? onlyAvailableNow,
    SessionDuration? preferredDuration,
    String? searchQuery,
  }) {
    return ServiceFilter(
      types: types ?? this.types,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      minRating: minRating ?? this.minRating,
      tags: tags ?? this.tags,
      onlyAvailableNow: onlyAvailableNow ?? this.onlyAvailableNow,
      preferredDuration: preferredDuration ?? this.preferredDuration,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  bool get isEmpty => 
    types.isEmpty && 
    minPrice == null && 
    maxPrice == null && 
    minRating == null && 
    tags.isEmpty && 
    !onlyAvailableNow && 
    preferredDuration == null &&
    (searchQuery == null || searchQuery!.trim().isEmpty);

  int get activeFiltersCount {
    int count = 0;
    if (types.isNotEmpty) count++;
    if (minPrice != null || maxPrice != null) count++;
    if (minRating != null) count++;
    if (tags.isNotEmpty) count++;
    if (onlyAvailableNow) count++;
    if (preferredDuration != null) count++;
    if (searchQuery != null && searchQuery!.trim().isNotEmpty) count++;
    return count;
  }
}
// data/models/review.dart
class Review {
  final String id;
  final String labId;
  final String userId;
  final String position; // PhD, MS, Undergrad, PostDoc
  final String duration;
  final DateTime reviewDate;
  final double rating;
  final Map<String, double> categoryRatings;
  final String reviewText;
  final List<String> pros;
  final List<String> cons;
  final int helpfulCount;
  final bool isVerified;

  Review({
    required this.id,
    required this.labId,
    required this.userId,
    required this.position,
    required this.duration,
    required this.reviewDate,
    required this.rating,
    required this.categoryRatings,
    required this.reviewText,
    required this.pros,
    required this.cons,
    this.helpfulCount = 0,
    this.isVerified = false,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      labId: json['labId'],
      userId: json['userId'],
      position: json['position'],
      duration: json['duration'],
      reviewDate: DateTime.parse(json['reviewDate']),
      rating: json['rating'].toDouble(),
      categoryRatings: Map<String, double>.from(
        json['categoryRatings'].map(
              (key, value) => MapEntry(key, value.toDouble()),
        ),
      ),
      reviewText: json['reviewText'],
      pros: List<String>.from(json['pros']),
      cons: List<String>.from(json['cons']),
      helpfulCount: json['helpfulCount'] ?? 0,
      isVerified: json['isVerified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'labId': labId,
      'userId': userId,
      'position': position,
      'duration': duration,
      'reviewDate': reviewDate.toIso8601String(),
      'rating': rating,
      'categoryRatings': categoryRatings,
      'reviewText': reviewText,
      'pros': pros,
      'cons': cons,
      'helpfulCount': helpfulCount,
      'isVerified': isVerified,
    };
  }

  Review copyWith({
    String? id,
    String? labId,
    String? userId,
    String? position,
    String? duration,
    DateTime? reviewDate,
    double? rating,
    Map<String, double>? categoryRatings,
    String? reviewText,
    List<String>? pros,
    List<String>? cons,
    int? helpfulCount,
    bool? isVerified,
  }) {
    return Review(
      id: id ?? this.id,
      labId: labId ?? this.labId,
      userId: userId ?? this.userId,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      reviewDate: reviewDate ?? this.reviewDate,
      rating: rating ?? this.rating,
      categoryRatings: categoryRatings ?? this.categoryRatings,
      reviewText: reviewText ?? this.reviewText,
      pros: pros ?? this.pros,
      cons: cons ?? this.cons,
      helpfulCount: helpfulCount ?? this.helpfulCount,
      isVerified: isVerified ?? this.isVerified,
    );
  }
}

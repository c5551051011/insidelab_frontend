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
  final bool? userVote; // null = no vote, true = helpful, false = not helpful
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
    this.userVote,
    this.isVerified = false,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'].toString(),
      labId: json['lab']?.toString() ?? json['labId']?.toString() ?? '',
      userId: json['user']?.toString() ?? json['userId']?.toString() ?? '',
      position: json['position'] ?? '',
      duration: json['duration'] ?? '',
      reviewDate: DateTime.parse(json['created_at'] ?? json['reviewDate'] ?? DateTime.now().toIso8601String()),
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0,
      categoryRatings: Map<String, double>.from(
        (json['category_ratings'] ?? json['categoryRatings'] ?? {}).map(
              (key, value) => MapEntry(key, double.tryParse(value.toString()) ?? 0.0),
        ),
      ),
      reviewText: json['review_text'] ?? json['reviewText'] ?? '',
      pros: List<String>.from(json['pros'] ?? []),
      cons: List<String>.from(json['cons'] ?? []),
      helpfulCount: json['helpful_count'] ?? json['helpfulCount'] ?? 0,
      userVote: json['user_vote'] ?? json['userVote'],
      isVerified: json['is_verified'] ?? json['isVerified'] ?? false,
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
      'userVote': userVote,
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
    bool? userVote,
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
      userVote: userVote ?? this.userVote,
      isVerified: isVerified ?? this.isVerified,
    );
  }
}

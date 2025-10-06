// lib/data/models/lab.dart
class Lab {
  final String id;
  final String name;
  final String professorName;
  final String professorId;
  final String universityName;
  final String universityId;
  final String department;
  final String? departmentId;
  final String? researchGroupName;
  final String? researchGroupId;
  final double overallRating;
  final int reviewCount;
  final List<String> researchAreas;
  final List<String> tags;
  final String? description;
  final String? website;
  final int? labSize;
  final Map<String, double>? ratingBreakdown;
  final List<ResearchTopic>? researchTopics;
  final List<Publication>? recentPublications;
  final RecruitmentStatus? recruitmentStatus;

  Lab({
    required this.id,
    required this.name,
    required this.professorName,
    required this.professorId,
    required this.universityName,
    required this.universityId,
    required this.department,
    this.departmentId,
    this.researchGroupName,
    this.researchGroupId,
    required this.overallRating,
    required this.reviewCount,
    required this.researchAreas,
    required this.tags,
    this.description,
    this.website,
    this.labSize,
    this.ratingBreakdown,
    this.researchTopics,
    this.recentPublications,
    this.recruitmentStatus,
  });

  factory Lab.fromJson(Map<String, dynamic> json) {
    return Lab(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      professorName: json['professor_name'] ?? json['professor']?['name'] ?? '',
      professorId: json['professor_id']?.toString() ?? json['professor']?['id']?.toString() ?? '',
      universityName: json['university_name'] ?? '',
      universityId: json['university']?.toString() ?? '',
      department: json['department'] ?? json['department_name'] ?? json['department_local_name'] ?? '',
      departmentId: json['university_department']?.toString(),
      researchGroupName: json['professor']?['research_group_name'],
      researchGroupId: json['research_group']?.toString(),
      overallRating: double.tryParse(json['overall_rating']?.toString() ?? '0') ?? 0.0,
      reviewCount: json['review_count'] ?? 0,
      researchAreas: List<String>.from(json['research_areas'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      description: json['description'],
      website: json['website'],
      labSize: json['lab_size'],
      ratingBreakdown: json['rating_breakdown'] != null
          ? Map<String, double>.from(
        (json['rating_breakdown'] as Map).map(
              (key, value) => MapEntry(key, value.toDouble()),
        ),
      )
          : null,
      researchTopics: json['research_topics'] != null
          ? List<ResearchTopic>.from(
          json['research_topics'].map((x) => ResearchTopic.fromJson(x)))
          : null,
      recentPublications: json['recent_publications'] != null
          ? List<Publication>.from(
          json['recent_publications'].map((x) => Publication.fromJson(x)))
          : null,
      recruitmentStatus: json['recruitment_status'] != null
          ? RecruitmentStatus.fromJson(json['recruitment_status'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'professor_name': professorName,
      'professor_id': professorId,
      'university_name': universityName,
      'university_id': universityId,
      'department': department,
      'department_id': departmentId,
      'research_group_name': researchGroupName,
      'research_group_id': researchGroupId,
      'overall_rating': overallRating,
      'review_count': reviewCount,
      'research_areas': researchAreas,
      'tags': tags,
      'description': description,
      'website': website,
      'lab_size': labSize,
      'rating_breakdown': ratingBreakdown,
      'research_topics': researchTopics?.map((x) => x.toJson()).toList(),
      'recent_publications': recentPublications?.map((x) => x.toJson()).toList(),
      'recruitment_status': recruitmentStatus?.toJson(),
    };
  }

  // Helper methods for displaying hierarchy
  String get affiliationLine {
    final parts = <String>[];
    parts.add(professorName);
    parts.add(universityName);
    return parts.join(' • ');
  }

  String get hierarchyLine {
    final parts = <String>[universityName, department];
    if (researchGroupName != null) {
      parts.add(researchGroupName!);
    }
    return parts.join(' > ');
  }

  String get fullHierarchy {
    final parts = <String>[universityName, department];
    if (researchGroupName != null) {
      parts.add(researchGroupName!);
    }
    parts.add(name);
    return parts.join(' > ');
  }

  bool get hasResearchGroup => researchGroupName != null && researchGroupName!.isNotEmpty;

  // Generate a simple URL-friendly slug from lab name
  String get slug {
    return name.toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s]'), '')
        .replaceAll(RegExp(r'\s+'), '-');
  }

  // Since we're using name-based slugs, we need to search by name
  static String getNameFromSlug(String slug) {
    return slug.replaceAll('-', ' ');
  }
}

// ResearchTopic 모델
class ResearchTopic {
  final String title;
  final String description;
  final List<String> keywords;
  final String? fundingInfo;

  ResearchTopic({
    required this.title,
    required this.description,
    required this.keywords,
    this.fundingInfo,
  });

  factory ResearchTopic.fromJson(Map<String, dynamic> json) {
    return ResearchTopic(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      keywords: List<String>.from(json['keywords'] ?? []),
      fundingInfo: json['funding_info'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'keywords': keywords,
      'funding_info': fundingInfo,
    };
  }
}

// Publication 모델
class Publication {
  final String title;
  final List<String> authors;
  final String venue;
  final int year;
  final String? url;
  final String? abstract;
  final int? citations;

  Publication({
    required this.title,
    required this.authors,
    required this.venue,
    required this.year,
    this.url,
    this.abstract,
    this.citations,
  });

  factory Publication.fromJson(Map<String, dynamic> json) {
    return Publication(
      title: json['title'] ?? '',
      authors: List<String>.from(json['authors'] ?? []),
      venue: json['venue'] ?? '',
      year: json['year'] ?? DateTime.now().year,
      url: json['url'],
      abstract: json['abstract'],
      citations: json['citations'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'authors': authors,
      'venue': venue,
      'year': year,
      'url': url,
      'abstract': abstract,
      'citations': citations,
    };
  }
}

// RecruitmentStatus 모델
class RecruitmentStatus {
  final bool isRecruitingPhD;
  final bool isRecruitingPostdoc;
  final bool isRecruitingIntern;
  final String? notes;
  final DateTime? lastUpdated;

  RecruitmentStatus({
    required this.isRecruitingPhD,
    required this.isRecruitingPostdoc,
    required this.isRecruitingIntern,
    this.notes,
    this.lastUpdated,
  });

  factory RecruitmentStatus.fromJson(Map<String, dynamic> json) {
    return RecruitmentStatus(
      isRecruitingPhD: json['is_recruiting_phd'] ?? false,
      isRecruitingPostdoc: json['is_recruiting_postdoc'] ?? false,
      isRecruitingIntern: json['is_recruiting_intern'] ?? false,
      notes: json['notes'],
      lastUpdated: json['last_updated'] != null
          ? DateTime.parse(json['last_updated'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_recruiting_phd': isRecruitingPhD,
      'is_recruiting_postdoc': isRecruitingPostdoc,
      'is_recruiting_intern': isRecruitingIntern,
      'notes': notes,
      'last_updated': lastUpdated?.toIso8601String(),
    };
  }
}
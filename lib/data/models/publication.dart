// data/models/publication.dart
class Publication {
  final String id;
  final String title;
  final List<String> authors;
  final String venue;
  final String year;
  final String? abstract;
  final int citations;
  final int? githubStars;
  final String? award;
  final List<String> tags;
  final Map<String, String> links;
  final bool isTopTier;
  final DateTime createdAt;
  final DateTime updatedAt;

  Publication({
    required this.id,
    required this.title,
    required this.authors,
    required this.venue,
    required this.year,
    this.abstract,
    this.citations = 0,
    this.githubStars,
    this.award,
    this.tags = const [],
    this.links = const {},
    this.isTopTier = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Publication.fromJson(Map<String, dynamic> json) {
    return Publication(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      authors: List<String>.from(json['authors'] ?? []),
      venue: json['venue'] ?? '',
      year: json['year']?.toString() ?? '',
      abstract: json['abstract'],
      citations: json['citations'] ?? 0,
      githubStars: json['github_stars'],
      award: json['award'],
      tags: List<String>.from(json['tags'] ?? []),
      links: Map<String, String>.from(json['links'] ?? {}),
      isTopTier: json['is_top_tier'] ?? false,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'authors': authors,
      'venue': venue,
      'year': year,
      'abstract': abstract,
      'citations': citations,
      'github_stars': githubStars,
      'award': award,
      'tags': tags,
      'links': links,
      'is_top_tier': isTopTier,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class PublicationStats {
  final int totalCitations;
  final int hIndex;
  final int totalPublications;
  final int thisYearPublications;

  PublicationStats({
    required this.totalCitations,
    required this.hIndex,
    required this.totalPublications,
    required this.thisYearPublications,
  });

  factory PublicationStats.fromJson(Map<String, dynamic> json) {
    return PublicationStats(
      totalCitations: json['total_citations'] ?? 0,
      hIndex: json['h_index'] ?? 0,
      totalPublications: json['total_publications'] ?? 0,
      thisYearPublications: json['this_year_publications'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_citations': totalCitations,
      'h_index': hIndex,
      'total_publications': totalPublications,
      'this_year_publications': thisYearPublications,
    };
  }
}
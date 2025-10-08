// data/models/publication.dart
class Publication {
  final String id;
  final String title;
  final String? abstract;
  final String publicationYear;
  final DateTime? publicationDate;
  final String? doi;
  final String? arxivId;
  final int citationCount;
  final List<String> authors;
  final String? firstAuthorName;
  final int authorCount;
  final String primaryVenueName;
  final String? primaryVenueTier;
  final List<String> researchAreaNames;
  final List<String> keywords;
  final String? additionalNotes;
  final String? paperUrl;
  final String? codeUrl;
  final bool isOpenAccess;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Additional fields for all publications view
  final bool isAwardPaper;
  final int githubStars;
  final String presentationType;

  Publication({
    required this.id,
    required this.title,
    this.abstract,
    required this.publicationYear,
    this.publicationDate,
    this.doi,
    this.arxivId,
    this.citationCount = 0,
    required this.authors,
    this.firstAuthorName,
    this.authorCount = 0,
    required this.primaryVenueName,
    this.primaryVenueTier,
    this.researchAreaNames = const [],
    this.keywords = const [],
    this.additionalNotes,
    this.paperUrl,
    this.codeUrl,
    this.isOpenAccess = false,
    required this.createdAt,
    required this.updatedAt,

    // Additional fields for all publications view
    this.isAwardPaper = false,
    this.githubStars = 0,
    this.presentationType = '',
  });

  factory Publication.fromJson(Map<String, dynamic> json) {
    // Parse authors - they come as a simple list of strings
    List<String> authorNames = [];
    if (json['authors'] is List) {
      authorNames = (json['authors'] as List)
          .map((author) => author.toString())
          .toList();
    }

    // Parse research area names
    List<String> researchAreas = [];
    if (json['research_area_names'] is List) {
      researchAreas = (json['research_area_names'] as List)
          .map((area) => area.toString())
          .toList();
    }

    // Parse keywords
    List<String> keywordsList = [];
    if (json['keywords'] is List) {
      keywordsList = (json['keywords'] as List)
          .map((keyword) => keyword.toString())
          .toList();
    }

    return Publication(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      abstract: json['abstract'],
      publicationYear: json['publication_year']?.toString() ?? '',
      publicationDate: json['publication_date'] != null
          ? DateTime.tryParse(json['publication_date'])
          : null,
      doi: json['doi'],
      arxivId: json['arxiv_id'],
      citationCount: json['citation_count'] ?? 0,
      authors: authorNames,
      firstAuthorName: json['first_author_name'],
      authorCount: json['author_count'] ?? authorNames.length,
      primaryVenueName: json['primary_venue_name'] ?? '',
      primaryVenueTier: json['primary_venue_tier'],
      researchAreaNames: researchAreas,
      keywords: keywordsList,
      additionalNotes: json['additional_notes'],
      paperUrl: json['paper_url'],
      codeUrl: json['code_url'],
      isOpenAccess: json['is_open_access'] ?? false,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),

      // Additional fields for all publications view
      isAwardPaper: json['is_award_paper'] is bool ? json['is_award_paper'] : false,
      githubStars: json['github_stars'] is int ? json['github_stars'] : (json['github_stars'] is String ? int.tryParse(json['github_stars']) ?? 0 : 0),
      presentationType: json['presentation_type']?.toString() ?? '',
    );
  }


  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'abstract': abstract,
      'publication_year': publicationYear,
      'publication_date': publicationDate?.toIso8601String(),
      'doi': doi,
      'arxiv_id': arxivId,
      'citation_count': citationCount,
      'authors': authors,
      'first_author_name': firstAuthorName,
      'author_count': authorCount,
      'primary_venue_name': primaryVenueName,
      'primary_venue_tier': primaryVenueTier,
      'research_area_names': researchAreaNames,
      'keywords': keywords,
      'additional_notes': additionalNotes,
      'paper_url': paperUrl,
      'code_url': codeUrl,
      'is_open_access': isOpenAccess,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Helper method to get available links
  Map<String, String> get links {
    final Map<String, String> linkMap = {};

    if (paperUrl != null && paperUrl!.isNotEmpty) {
      linkMap['Paper'] = paperUrl!;
    }
    if (codeUrl != null && codeUrl!.isNotEmpty) {
      linkMap['Code'] = codeUrl!;
    }
    if (doi != null && doi!.isNotEmpty) {
      linkMap['DOI'] = 'https://doi.org/$doi';
    }
    if (arxivId != null && arxivId!.isNotEmpty) {
      linkMap['ArXiv'] = 'https://arxiv.org/abs/$arxivId';
    }

    return linkMap;
  }

  // Backward compatibility getters
  String get venue => primaryVenueName;
  String get year => publicationYear;
  List<String> get researchAreas => researchAreaNames;
  List<String> get labAuthors => []; // Not available in current API, could be enhanced later
  bool get isTopTier => primaryVenueTier?.toLowerCase() == 'top';
  DateTime get publicationDateNonNull => publicationDate ?? createdAt;
}

class PublicationStats {
  final int totalCitations;
  final int hIndex;
  final int totalPublications;
  final int thisYearPublications;
  final double? averageCitationsPerPaper;
  final List<Map<String, dynamic>>? yearlyStats;

  PublicationStats({
    required this.totalCitations,
    required this.hIndex,
    required this.totalPublications,
    required this.thisYearPublications,
    this.averageCitationsPerPaper,
    this.yearlyStats,
  });

  factory PublicationStats.fromJson(Map<String, dynamic> json) {
    // Handle both direct stats and nested lab stats
    final stats = json['lab_stats'] ?? json;

    return PublicationStats(
      totalCitations: stats['total_citations'] ?? stats['citation_count'] ?? 0,
      hIndex: stats['h_index'] ?? 0,
      totalPublications: stats['total_publications'] ?? stats['publication_count'] ?? 0,
      thisYearPublications: stats['this_year_publications'] ?? stats['current_year_publications'] ?? 0,
      averageCitationsPerPaper: stats['average_citations_per_paper']?.toDouble(),
      yearlyStats: stats['yearly_stats'] != null
          ? List<Map<String, dynamic>>.from(stats['yearly_stats'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_citations': totalCitations,
      'h_index': hIndex,
      'total_publications': totalPublications,
      'this_year_publications': thisYearPublications,
      'average_citations_per_paper': averageCitationsPerPaper,
      'yearly_stats': yearlyStats,
    };
  }
}
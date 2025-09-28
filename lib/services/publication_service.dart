// services/publication_service.dart
import '../data/models/publication.dart';
import 'api_service.dart';

class PublicationService {
  /// Get publications for a specific lab
  static Future<List<Publication>> getLabPublications(String labId) async {
    try {
      final response = await ApiService.get('/labs/$labId/publications/');
      if (response is List) {
        return response.map((json) => Publication.fromJson(json)).toList();
      } else if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Publication.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error loading lab publications: $e');
      return _getMockPublications(labId);
    }
  }

  /// Get publication statistics for a lab
  static Future<PublicationStats?> getLabPublicationStats(String labId) async {
    try {
      final response = await ApiService.get('/labs/$labId/publication-stats/');
      return PublicationStats.fromJson(response);
    } catch (e) {
      print('Error loading publication stats: $e');
      return _getMockStats();
    }
  }

  /// Search publications
  static Future<List<Publication>> searchPublications(String query) async {
    try {
      final response = await ApiService.get('/publications/?search=${Uri.encodeComponent(query)}');
      if (response is List) {
        return response.map((json) => Publication.fromJson(json)).toList();
      } else if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Publication.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error searching publications: $e');
      return [];
    }
  }

  /// Get filtered publications
  static Future<List<Publication>> getFilteredPublications({
    String? labId,
    String? venue,
    String? year,
    List<String>? tags,
    bool? isTopTier,
  }) async {
    try {
      String endpoint = '/publications/';
      final params = <String>[];

      if (labId != null) params.add('lab=$labId');
      if (venue != null) params.add('venue=${Uri.encodeComponent(venue)}');
      if (year != null) params.add('year=$year');
      if (isTopTier != null) params.add('is_top_tier=$isTopTier');
      if (tags != null && tags.isNotEmpty) {
        params.add('tags=${tags.map((t) => Uri.encodeComponent(t)).join(',')}');
      }

      if (params.isNotEmpty) {
        endpoint += '?${params.join('&')}';
      }

      final response = await ApiService.get(endpoint);
      if (response is List) {
        return response.map((json) => Publication.fromJson(json)).toList();
      } else if (response is Map && response.containsKey('results')) {
        return (response['results'] as List)
            .map((json) => Publication.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Error loading filtered publications: $e');
      return [];
    }
  }

  // Mock data for development/fallback
  static List<Publication> _getMockPublications(String labId) {
    return [
      Publication(
        id: '1',
        title: 'Haptic-Enabled Robotic Manipulation in Unstructured Environments',
        authors: ['Sarah Chen', 'Michael Johnson', 'Oussama Khatib'],
        venue: 'ICRA 2024',
        year: '2024',
        abstract: 'This paper presents a novel approach for haptic-enabled robotic manipulation in unstructured environments. Our method combines advanced force feedback with real-time visual processing to enable precise object manipulation in complex scenarios...',
        citations: 42,
        githubStars: 234,
        award: 'Best Paper Award',
        tags: ['Robotics', 'Haptic Technology', 'Manipulation'],
        links: {
          'Paper': 'https://example.com/paper1',
          'Code': 'https://github.com/example/project1',
          'Video': 'https://youtube.com/watch?v=example1',
        },
        isTopTier: true,
        createdAt: DateTime(2024, 1, 15),
        updatedAt: DateTime(2024, 1, 15),
      ),
      Publication(
        id: '2',
        title: 'Multi-Robot Coordination for Dynamic Task Allocation',
        authors: ['Alex Rodriguez', 'Oussama Khatib', 'David Wilson'],
        venue: 'IEEE Robotics',
        year: '2024',
        abstract: 'We propose a distributed algorithm for multi-robot coordination that enables dynamic task allocation in real-time. The approach demonstrates significant improvements in efficiency and adaptability compared to existing methods...',
        citations: 28,
        githubStars: 156,
        tags: ['Multi-Robot Systems', 'Task Allocation', 'Coordination'],
        links: {
          'Paper': 'https://example.com/paper2',
          'Code': 'https://github.com/example/project2',
        },
        isTopTier: false,
        createdAt: DateTime(2024, 2, 10),
        updatedAt: DateTime(2024, 2, 10),
      ),
    ];
  }

  static PublicationStats _getMockStats() {
    return PublicationStats(
      totalCitations: 2847,
      hIndex: 34,
      totalPublications: 156,
      thisYearPublications: 12,
    );
  }
}
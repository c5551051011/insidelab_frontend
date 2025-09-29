// services/venue_service.dart
import 'api_service.dart';

class VenueService {
  /// Get top-tier venues (with optional lab filtering)
  static Future<List<Map<String, dynamic>>> getTopTierVenues({String? labId}) async {
    try {
      String endpoint = '/venues/top-tier/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return List<Map<String, dynamic>>.from(response['results']);
      } else if (response is List) {
        return List<Map<String, dynamic>>.from(response);
      }
      return [];
    } catch (e) {
      print('Error fetching top-tier venues: $e');
      return [];
    }
  }

  /// Get all venues (with optional lab filtering)
  static Future<List<Map<String, dynamic>>> getAllVenues({String? labId}) async {
    try {
      String endpoint = '/venues/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return List<Map<String, dynamic>>.from(response['results']);
      } else if (response is List) {
        return List<Map<String, dynamic>>.from(response);
      }
      return [];
    } catch (e) {
      print('Error fetching venues: $e');
      return [];
    }
  }

  /// Get venue statistics (with optional lab filtering)
  static Future<Map<String, dynamic>?> getVenueStatistics({String? labId}) async {
    try {
      String endpoint = '/venues/statistics/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);
      return response as Map<String, dynamic>?;
    } catch (e) {
      print('Error fetching venue statistics: $e');
      return null;
    }
  }

  /// Search venues by name or abbreviation
  static Future<List<Map<String, dynamic>>> searchVenues(String query, {String? labId}) async {
    try {
      String endpoint = '/venues/?search=${Uri.encodeComponent(query)}';
      if (labId != null) {
        endpoint += '&lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return List<Map<String, dynamic>>.from(response['results']);
      } else if (response is List) {
        return List<Map<String, dynamic>>.from(response);
      }
      return [];
    } catch (e) {
      print('Error searching venues: $e');
      return [];
    }
  }

  /// Get venue details by ID
  static Future<Map<String, dynamic>?> getVenueById(String venueId) async {
    try {
      final response = await ApiService.get('/venues/$venueId/');
      return response as Map<String, dynamic>?;
    } catch (e) {
      print('Error fetching venue by ID: $e');
      return null;
    }
  }

  /// Get publications by venue (with optional lab filtering)
  static Future<List<Map<String, dynamic>>> getPublicationsByVenue(
    String venueId, {
    String? labId,
  }) async {
    try {
      String endpoint = '/venues/$venueId/publications/';
      if (labId != null) {
        endpoint += '?lab=$labId';
      }

      final response = await ApiService.get(endpoint);

      if (response is Map && response.containsKey('results')) {
        return List<Map<String, dynamic>>.from(response['results']);
      } else if (response is List) {
        return List<Map<String, dynamic>>.from(response);
      }
      return [];
    } catch (e) {
      print('Error fetching publications by venue: $e');
      return [];
    }
  }
}
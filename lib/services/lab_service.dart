// lib/services/lab_service.dart
import '../data/models/lab.dart';
import 'api_service.dart';

class LabService {
  static Future<List<Lab>> getFeaturedLabs() async {
    final response = await ApiService.get('/labs/featured/');
    return (response as List).map((json) => Lab.fromJson(json)).toList();
  }

  static Future<Lab> getLabById(String id) async {
    final response = await ApiService.get('/labs/$id/');
    return Lab.fromJson(response);
  }

  static Future<Map<String, dynamic>> searchLabs({
    String? query,
    Map<String, dynamic>? filters,
    int page = 1,
  }) async {
    String endpoint = '/labs/?page=$page';

    if (query != null && query.isNotEmpty) {
      endpoint += '&search=$query';
    }

    if (filters != null) {
      filters.forEach((key, value) {
        if (value != null && value.toString().isNotEmpty) {
          endpoint += '&$key=$value';
        }
      });
    }

    return await ApiService.get(endpoint);
  }

  static Future<List<Lab>> getRecruitingLabs(String position) async {
    final response = await ApiService.get('/labs/recruiting/?position=$position');
    return (response as List).map((json) => Lab.fromJson(json)).toList();
  }
}
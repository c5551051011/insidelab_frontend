// data/repositories/lab_repository.dart
import '../models/lab.dart';

abstract class LabRepository {
  Future<List<Lab>> getFeaturedLabs();
  Future<Lab?> getLabById(String id);
  Future<List<Lab>> searchLabs(String query, Map<String, dynamic>? filters);
  Future<List<Lab>> getLabsByUniversity(String universityId);
  Future<List<Lab>> getLabsByProfessor(String professorId);
  Future<void> updateLabRating(String labId);
}

class LabRepositoryImpl implements LabRepository {
  // TODO: Replace with actual API calls

  @override
  Future<List<Lab>> getFeaturedLabs() async {
    // Simulate API delay
    await Future.delayed(const Duration(seconds: 1));

    return [
      Lab(
        id: '1',
        name: 'Stanford AI Lab',
        professorName: 'Dr. Andrew Ng',
        professorId: 'prof1',
        universityName: 'Stanford University',
        universityId: 'uni1',
        department: 'Computer Science',
        overallRating: 4.8,
        reviewCount: 156,
        researchAreas: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
        tags: ['Well Funded', 'Industry Connections', 'Flexible Hours'],
        description: 'Leading AI research lab focused on deep learning and applications',
        website: 'https://ai.stanford.edu',
        labSize: 25,
        ratingBreakdown: {
          'Research Environment': 4.8,
          'Advisor Support': 4.6,
          'Work-Life Balance': 4.2,
          'Career Development': 4.9,
          'Funding Availability': 4.7,
        },
      ),
      Lab(
        id: '2',
        name: 'CMU Machine Learning Department',
        professorName: 'Dr. Tom Mitchell',
        professorId: 'prof2',
        universityName: 'Carnegie Mellon University',
        universityId: 'uni2',
        department: 'Machine Learning',
        overallRating: 4.9,
        reviewCount: 203,
        researchAreas: ['ML Theory', 'Statistical Learning', 'AI Systems'],
        tags: ['Top Tier', 'Large Lab', 'Publication Heavy'],
        description: 'World-renowned ML department with diverse research areas',
        website: 'https://ml.cmu.edu',
        labSize: 40,
      ),
      Lab(
        id: '3',
        name: 'MIT CSAIL Vision Group',
        professorName: 'Dr. Antonio Torralba',
        professorId: 'prof3',
        universityName: 'MIT',
        universityId: 'uni3',
        department: 'EECS',
        overallRating: 4.7,
        reviewCount: 98,
        researchAreas: ['Computer Vision', '3D Vision', 'Scene Understanding'],
        tags: ['Collaborative', 'Innovation Focused', 'Small Team'],
        description: 'Cutting-edge computer vision research with industry impact',
        website: 'https://groups.csail.mit.edu/vision/',
        labSize: 15,
      ),
    ];
  }

  @override
  Future<Lab?> getLabById(String id) async {
    final labs = await getFeaturedLabs();
    try {
      return labs.firstWhere((lab) => lab.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<Lab>> searchLabs(String query, Map<String, dynamic>? filters) async {
    // Simulate search
    await Future.delayed(const Duration(seconds: 1));

    final allLabs = await getFeaturedLabs();

    // Simple text search
    return allLabs.where((lab) {
      final searchLower = query.toLowerCase();
      return lab.name.toLowerCase().contains(searchLower) ||
          lab.professorName.toLowerCase().contains(searchLower) ||
          lab.universityName.toLowerCase().contains(searchLower) ||
          lab.researchAreas.any((area) => area.toLowerCase().contains(searchLower));
    }).toList();
  }

  @override
  Future<List<Lab>> getLabsByUniversity(String universityId) async {
    final allLabs = await getFeaturedLabs();
    return allLabs.where((lab) => lab.universityId == universityId).toList();
  }

  @override
  Future<List<Lab>> getLabsByProfessor(String professorId) async {
    final allLabs = await getFeaturedLabs();
    return allLabs.where((lab) => lab.professorId == professorId).toList();
  }

  @override
  Future<void> updateLabRating(String labId) async {
    // TODO: Recalculate lab rating based on reviews
    await Future.delayed(const Duration(milliseconds: 500));
  }
}

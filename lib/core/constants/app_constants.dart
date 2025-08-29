// core/constants/app_constants.dart
class AppConstants {
  // API Endpoints
  static const String baseUrl = 'https://api.insidelab.com';
  static const String apiVersion = '/v1';

  // Pagination
  static const int pageSize = 20;
  static const int maxSearchResults = 100;

  // Cache Duration
  static const Duration cacheExpiration = Duration(hours: 1);

  // Review Constraints
  static const int minReviewLength = 50;
  static const int maxReviewLength = 2000;
  static const int maxProsConsItems = 5;

  // Rating Categories
  static const List<String> ratingCategories = [
    'Research Environment',
    'Advisor Support',
    'Work-Life Balance',
    'Career Development',
    'Funding Availability',
  ];

  // Position Options
  static const List<String> positions = [
    'PhD Student',
    'MS Student',
    'Undergraduate',
    'PostDoc',
    'Research Staff',
    'Visiting Researcher',
  ];

  // Duration Options
  static const List<String> durations = [
    '< 1 year',
    '1-2 years',
    '2-3 years',
    '3-4 years',
    '4+ years',
  ];

  // Research Areas
  static const List<String> researchAreas = [
    'Machine Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics',
    'AI Theory',
    'Deep Learning',
    'Reinforcement Learning',
    'AI Safety',
    'Human-Computer Interaction',
    'Computational Biology',
    'Data Science',
    'Systems',
    'Security',
    'Graphics',
    'Theory of Computation',
  ];

  // Lab Tags
  static const List<String> labTags = [
    'Well Funded',
    'International Friendly',
    'Industry Connections',
    'Flexible Hours',
    'Remote Work',
    'Small Team',
    'Large Lab',
    'Publication Heavy',
    'Collaborative',
    'Independent Work',
    'Mentorship Focused',
    'Conference Travel',
    'Summer Funding',
    'TA Required',
    'Startup Culture',
  ];
}

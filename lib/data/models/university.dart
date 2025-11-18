// data/models/university.dart
class University {
  final String id;
  final String name;
  final String country;
  final String state;
  final String city;
  final String? website;
  final int? ranking;
  final String? logoUrl;

  University({
    required this.id,
    required this.name,
    required this.country,
    required this.state,
    required this.city,
    this.website,
    this.ranking,
    this.logoUrl,
  });

  factory University.fromJson(Map<String, dynamic> json) {
    return University(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      country: json['country'] ?? '',
      state: json['state'] ?? '',
      city: json['city'] ?? '',
      website: json['website'],
      ranking: json['ranking'],
      logoUrl: json['logoUrl'] ?? json['logo_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'country': country,
      'state': state,
      'city': city,
      'website': website,
      'ranking': ranking,
      'logoUrl': logoUrl,
    };
  }
}

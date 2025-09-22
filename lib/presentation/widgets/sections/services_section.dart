import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class ServicesSection extends StatelessWidget {
  const ServicesSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;
    final isTablet = screenSize.width >= 768 && screenSize.width < 1024;

    return Container(
      color: AppColors.background,
      padding: EdgeInsets.symmetric(
        vertical: isMobile ? 56 : 96,
        horizontal: 24,
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              _buildSectionHeader(context, isMobile),
              SizedBox(height: isMobile ? 40 : 64),
              _buildServiceCards(context, isMobile, isTablet),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, bool isMobile) {
    return Column(
      children: [
        Text(
          'Everything You Need for Graduate School Success',
          style: TextStyle(
            fontSize: isMobile ? 28 : 36,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildServiceCards(BuildContext context, bool isMobile, bool isTablet) {
    final services = [
      {
        'emoji': '🔍',
        'title': 'Search Lab Reviews',
        'description': 'Discover authentic reviews from current and former graduate students about research labs, professors, and programs.',
        'features': [
          'Filter by university, department, or research area',
          'Read detailed anonymous reviews',
          'Compare lab ratings and metrics',
          'Save labs to your watchlist',
        ],
        'buttonText': 'Explore Reviews',
        'imagePath': 'images/review_image.png',
        'route': '/reviews',
      },
      {
        'emoji': '📄',
        'title': 'CV & Resume Feedback',
        'description': 'Get professional feedback on your academic CV and resume from experienced graduate students and industry professionals.',
        'features': [
          'AI-powered initial screening',
          'Human expert review and comments',
          'Field-specific formatting guidelines',
          'Before/after improvement tracking',
        ],
        'buttonText': 'Upload Document',
        'imagePath': 'images/resume_image.png',
        'route': '/services/cv-review',
      },
      {
        'emoji': '🎤',
        'title': 'Mock Interview Sessions',
        'description': 'Practice PhD admissions and job interviews with personalized mock sessions tailored to your field and target programs.',
        'features': [
          'AI-powered interview simulation',
          'Field-specific question databases',
          'Real-time feedback and scoring',
          'Video analysis and improvement tips',
        ],
        'buttonText': 'Start Practice',
        'imagePath': 'images/interview_image.png',
        'route': '/services/mock-interview',
      },
    ];

    if (isMobile) {
      return Column(
        children: services.map((service) => Container(
          margin: const EdgeInsets.only(bottom: 24),
          child: _buildServiceCard(
            context: context,
            emoji: service['emoji'] as String,
            title: service['title'] as String,
            description: service['description'] as String,
            features: service['features'] as List<String>,
            buttonText: service['buttonText'] as String,
            imagePath: service['imagePath'] as String,
            route: service['route'] as String,
          ),
        )).toList(),
      );
    } else if (isTablet) {
      return Column(
        children: [
          IntrinsicHeight(
            child: Row(
              children: [
                Expanded(
                  child: _buildServiceCard(
                    context: context,
                    emoji: services[0]['emoji'] as String,
                    title: services[0]['title'] as String,
                    description: services[0]['description'] as String,
                    features: services[0]['features'] as List<String>,
                    buttonText: services[0]['buttonText'] as String,
                    imagePath: services[0]['imagePath'] as String,
                    route: services[0]['route'] as String,
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: _buildServiceCard(
                    context: context,
                    emoji: services[1]['emoji'] as String,
                    title: services[1]['title'] as String,
                    description: services[1]['description'] as String,
                    features: services[1]['features'] as List<String>,
                    buttonText: services[1]['buttonText'] as String,
                    imagePath: services[1]['imagePath'] as String,
                    route: services[1]['route'] as String,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 400),
              child: _buildServiceCard(
                context: context,
                emoji: services[2]['emoji'] as String,
                title: services[2]['title'] as String,
                description: services[2]['description'] as String,
                features: services[2]['features'] as List<String>,
                buttonText: services[2]['buttonText'] as String,
                imagePath: services[2]['imagePath'] as String,
                route: services[2]['route'] as String,
              ),
            ),
          ),
        ],
      );
    } else {
      return IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: services.map((service) => Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 12),
              child: _buildServiceCard(
                context: context,
                emoji: service['emoji'] as String,
                title: service['title'] as String,
                description: service['description'] as String,
                features: service['features'] as List<String>,
                buttonText: service['buttonText'] as String,
                imagePath: service['imagePath'] as String,
                route: service['route'] as String,
              ),
            ),
          )).toList(),
        ),
      );
    }
  }

  Widget _buildServiceCard({
    required BuildContext context,
    required String emoji,
    required String title,
    required String description,
    required List<String> features,
    required String buttonText,
    required String imagePath,
    required String route,
  }) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => context.go(route),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                boxShadow: AppColors.cardShadowNarrow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Image thumbnail
                  Container(
                    height: 208,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        topRight: Radius.circular(12),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        topRight: Radius.circular(12),
                      ),
                      child: Image.asset(
                        imagePath,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          // Fallback placeholder with icon
                          return Container(
                            color: AppColors.primary.withOpacity(0.1),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _getServiceIcon(title),
                                  size: 48,
                                  color: AppColors.primary,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  title,
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  // Card content
                  Flexible(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    emoji,
                                    style: const TextStyle(
                                      fontSize: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      title,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                        fontFamily: 'Inter',
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                description,
                                style: const TextStyle(
                                  fontSize: 15,
                                  color: AppColors.textSecondary,
                                  height: 1.5,
                                  fontFamily: 'Inter',
                                ),
                              ),
                              const SizedBox(height: 16),
                              ...features.map((feature) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 16,
                                      height: 16,
                                      margin: EdgeInsets.only(right: 8, top: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.green,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.check,
                                        color: Colors.white,
                                        size: 10,
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        feature,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: AppColors.textSecondary,
                                          height: 1.4,
                                          fontFamily: 'Inter',
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              )).toList(),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.only(top: 20),
                            child: SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => context.go(route),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  elevation: 0,
                                ),
                                child: Text(
                                  buttonText,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'Inter',
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getServiceIcon(String title) {
    switch (title) {
      case 'Search Lab Reviews':
        return Icons.search;
      case 'CV & Resume Feedback':
        return Icons.description;
      case 'Mock Interview Sessions':
        return Icons.video_call;
      default:
        return Icons.school;
    }
  }
}
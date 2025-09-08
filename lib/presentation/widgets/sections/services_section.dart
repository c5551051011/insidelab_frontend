import 'package:flutter/material.dart';
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
        'title': 'Professor & Lab Reviews',
        'description': 'Read honest reviews from current grad students about professors, research labs, and program culture. Make informed decisions about your graduate school applications.',
        'imagePath': 'assets/images/review_image.png',
        'route': '/',
      },
      {
        'title': 'CV & Resume Feedback',
        'description': 'Get your CV reviewed by experienced professionals and current graduate students. Receive detailed feedback to improve your academic profile.',
        'imagePath': 'assets/images/resume_image.png',
        'route': '/cv-review',
      },
      {
        'title': 'Mock Interview Sessions',
        'description': 'Practice with experienced interviewers who know what graduate programs are looking for. Build confidence before your real interviews.',
        'imagePath': 'assets/images/interview_image.png',
        'route': '/mock-interview',
      },
    ];

    if (isMobile) {
      return Column(
        children: services.map((service) => Container(
          margin: const EdgeInsets.only(bottom: 24),
          child: _buildServiceCard(
            context: context,
            title: service['title'] as String,
            description: service['description'] as String,
            imagePath: service['imagePath'] as String,
            route: service['route'] as String,
          ),
        )).toList(),
      );
    } else if (isTablet) {
      return Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildServiceCard(
                  context: context,
                  title: services[0]['title'] as String,
                  description: services[0]['description'] as String,
                  imagePath: services[0]['imagePath'] as String,
                  route: services[0]['route'] as String,
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: _buildServiceCard(
                  context: context,
                  title: services[1]['title'] as String,
                  description: services[1]['description'] as String,
                  imagePath: services[1]['imagePath'] as String,
                  route: services[1]['route'] as String,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 400),
              child: _buildServiceCard(
                context: context,
                title: services[2]['title'] as String,
                description: services[2]['description'] as String,
                imagePath: services[2]['imagePath'] as String,
                route: services[2]['route'] as String,
              ),
            ),
          ),
        ],
      );
    } else {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: services.map((service) => Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 12),
            child: _buildServiceCard(
              context: context,
              title: service['title'] as String,
              description: service['description'] as String,
              imagePath: service['imagePath'] as String,
              route: service['route'] as String,
            ),
          ),
        )).toList(),
      );
    }
  }

  Widget _buildServiceCard({
    required BuildContext context,
    required String title,
    required String description,
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
            onTap: () => Navigator.pushNamed(context, route),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                boxShadow: AppColors.cardShadowNarrow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            fontFamily: 'Inter',
                          ),
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
                        Row(
                          children: [
                            Text(
                              'Learn More',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                                fontFamily: 'Inter',
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.arrow_forward,
                              size: 16,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                      ],
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
      case 'Professor & Lab Reviews':
        return Icons.star;
      case 'CV & Resume Feedback':
        return Icons.description;
      case 'Mock Interview Sessions':
        return Icons.video_call;
      default:
        return Icons.school;
    }
  }
}
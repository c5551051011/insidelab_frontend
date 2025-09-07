import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class TestimonialsSection extends StatelessWidget {
  const TestimonialsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;
    final isTablet = screenSize.width >= 768 && screenSize.width < 1024;

    return Container(
      color: AppColors.background,
      padding: EdgeInsets.symmetric(
        vertical: 80,
        horizontal: 24,
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              _buildSectionHeader(context, isMobile),
              SizedBox(height: isMobile ? 40 : 48),
              _buildTestimonialCards(context, isMobile, isTablet),
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
          'What Our Users Say',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Container(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Text(
            'Real testimonials from students who successfully got into their dream graduate programs.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  Widget _buildTestimonialCards(BuildContext context, bool isMobile, bool isTablet) {
    final testimonials = [
      {
        'name': 'Sarah Chen',
        'role': 'MIT Computer Science',
        'avatar': 'assets/images/avatar_sarah.jpg',
        'rating': 5,
        'testimonial': 'The mock interview sessions were incredibly realistic and helped me identify my weak points. I felt so much more confident during my actual interviews at top-tier programs.',
      },
      {
        'name': 'Marcus Johnson',
        'role': 'Stanford Economics PhD',
        'avatar': 'assets/images/avatar_marcus.jpg',
        'rating': 5,
        'testimonial': 'The CV feedback service was phenomenal. They caught details I never would have noticed and helped me present my research experience in a much stronger way.',
      },
      {
        'name': 'Elena Rodríguez',
        'role': 'Harvard Medical School',
        'avatar': 'assets/images/avatar_elena.jpg',
        'rating': 5,
        'testimonial': 'The professor reviews were honest and incredibly detailed. I was able to choose the perfect lab match for my research interests thanks to the insider information from current students.',
      },
    ];

    if (isMobile) {
      return Column(
        children: testimonials.map((testimonial) => Container(
          margin: const EdgeInsets.only(bottom: 24),
          child: _buildTestimonialCard(testimonial),
        )).toList(),
      );
    } else if (isTablet) {
      return Column(
        children: [
          Row(
            children: [
              Expanded(child: _buildTestimonialCard(testimonials[0])),
              const SizedBox(width: 24),
              Expanded(child: _buildTestimonialCard(testimonials[1])),
            ],
          ),
          const SizedBox(height: 24),
          Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 400),
              child: _buildTestimonialCard(testimonials[2]),
            ),
          ),
        ],
      );
    } else {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: testimonials.map((testimonial) => Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 12),
            child: _buildTestimonialCard(testimonial),
          ),
        )).toList(),
      );
    }
  }

  Widget _buildTestimonialCard(Map<String, dynamic> testimonial) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: AppColors.border,
            width: 1,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User info row
              Row(
                children: [
                  // Profile avatar
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primary,
                    backgroundImage: AssetImage(testimonial['avatar']),
                    onBackgroundImageError: (exception, stackTrace) {
                      // Fallback handled by backgroundColor and child
                    },
                    child: Text(
                      testimonial['name'].toString().split(' ').map((n) => n[0]).join(''),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // User info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          testimonial['name'],
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            fontFamily: 'Inter',
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          testimonial['role'],
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Rating stars
              Row(
                children: List.generate(5, (index) => Icon(
                  Icons.star,
                  size: 16,
                  color: index < testimonial['rating'] 
                      ? AppColors.rating 
                      : Colors.grey[300],
                )),
              ),
              const SizedBox(height: 16),
              
              // Testimonial text
              Text(
                '"${testimonial['testimonial']}"',
                style: const TextStyle(
                  fontSize: 15,
                  color: AppColors.textPrimary,
                  height: 1.5,
                  fontFamily: 'Inter',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
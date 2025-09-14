import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../screens/home/widgets/search_bar_widget.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;
    
    return Container(
      height: screenSize.height * 0.9, // 90% of screen height
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage('images/hero_background.png'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.transparent,
            BlendMode.multiply,
          ),
          onError: (exception, stackTrace) {
            // Fallback to gradient background if image fails to load
          },
        ),
      ),
      child: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.heroOverlay,
        ),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 1200),
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? 24 : 48,
              vertical: 96,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildHeroContent(context, isMobile),
                SizedBox(height: isMobile ? 32 : 40),
                _buildSearchSection(context, isMobile),
                SizedBox(height: isMobile ? 24 : 32),
                _buildActionButtons(context, isMobile),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroContent(BuildContext context, bool isMobile) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 920),
      child: Column(
        children: [
          // Main Headline
          Text(
            'Your Gateway to Graduate School Success',
            style: TextStyle(
              fontSize: isMobile ? 36 : 56,
              fontWeight: FontWeight.w800,
              color: AppColors.heroText,
              height: 1.1,
              letterSpacing: -0.02,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: isMobile ? 20 : 24),
          // Subheading
          Container(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Text(
              'Search labs with detailed ratings, read honest reviews from current grad students, and find the perfect research environment for your goals.',
              style: TextStyle(
                fontSize: isMobile ? 16 : 20,
                color: AppColors.heroSubtext,
                height: 1.5,
                fontFamily: 'Inter',
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchSection(BuildContext context, bool isMobile) {
    return Column(
      children: [
        // Search Bar
        const SearchBarWidget(),
        SizedBox(height: isMobile ? 12 : 16),
        // Help Guide
        Container(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Text(
            'Search by university, professor, lab name, or research area',
            style: TextStyle(
              fontSize: isMobile ? 14 : 16,
              color: AppColors.heroSubtext.withOpacity(0.8),
              height: 1.4,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, bool isMobile) {
    if (isMobile) {
      // Stack buttons vertically on mobile
      return Column(
        children: [
          _buildWriteReviewButton(context),
          const SizedBox(height: 12),
          _buildMockInterviewButton(context),
        ],
      );
    } else {
      // Side by side on desktop
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildWriteReviewButton(context),
          const SizedBox(width: 16),
          _buildMockInterviewButton(context),
        ],
      );
    }
  }

  Widget _buildWriteReviewButton(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => Navigator.pushNamed(context, '/write-review'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 2,
      ).copyWith(
        backgroundColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return AppColors.primary.withOpacity(0.9);
          }
          return AppColors.primary;
        }),
        overlayColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return Colors.white.withOpacity(0.1);
          }
          return Colors.transparent;
        }),
      ),
      icon: const Icon(Icons.rate_review, size: 20),
      label: const Text(
        'Write Review',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }

  Widget _buildMockInterviewButton(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: () => Navigator.pushNamed(context, '/mock-interview'),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.heroText,
        side: const BorderSide(
          color: AppColors.heroText,
          width: 2,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        backgroundColor: Colors.transparent,
      ).copyWith(
        backgroundColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return Colors.white.withOpacity(0.08);
          }
          return Colors.transparent;
        }),
        overlayColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return Colors.white.withOpacity(0.05);
          }
          return Colors.transparent;
        }),
      ),
      icon: const Icon(Icons.videocam, size: 20),
      label: const Text(
        'Book Mock Interview',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }
}
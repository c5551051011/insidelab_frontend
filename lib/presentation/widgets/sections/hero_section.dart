import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

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
          image: AssetImage('assets/images/hero_background.jpg'),
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
                SizedBox(height: isMobile ? 40 : 56),
                _buildHeroButtons(context, isMobile),
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
              'Get insider reviews from current grad students, professional CV feedback, and mock interviews to ace your graduate school applications.',
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

  Widget _buildHeroButtons(BuildContext context, bool isMobile) {
    if (isMobile) {
      // Stack buttons vertically on mobile
      return Column(
        children: [
          _buildSecondaryButton(context),
          const SizedBox(height: 16),
          _buildPrimaryButton(context),
        ],
      );
    } else {
      // Side by side on desktop
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildSecondaryButton(context),
          const SizedBox(width: 16),
          _buildPrimaryButton(context),
        ],
      );
    }
  }

  Widget _buildPrimaryButton(BuildContext context) {
    return OutlinedButton(
      onPressed: () => Navigator.pushNamed(context, '/mock-interview'),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.heroText,
        side: const BorderSide(
          color: AppColors.heroText,
          width: 2,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
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
      child: const Text(
        'Book Mock Interview',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }

  Widget _buildSecondaryButton(BuildContext context) {
    return ElevatedButton(
      onPressed: () => Navigator.pushNamed(context, '/'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.primary,
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 0,
      ).copyWith(
        backgroundColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return Colors.grey[50]!;
          }
          return Colors.white;
        }),
        overlayColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return AppColors.primary.withOpacity(0.05);
          }
          return Colors.transparent;
        }),
      ),
      child: const Text(
        'Browse Reviews',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }
}
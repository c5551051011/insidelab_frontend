import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../screens/home/widgets/search_bar_widget.dart';

class HeroSection extends StatefulWidget {
  const HeroSection({Key? key}) : super(key: key);

  @override
  State<HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<HeroSection> {
  bool _overlayOpen = false;

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;
    
    return Container(
      height: screenSize.height * 0.9, // 90% of screen height
      constraints: const BoxConstraints(minHeight: 300), // Minimum height
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
              vertical: isMobile ? 48 : 96,
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                // Adjust spacing based on available height
                final availableHeight = constraints.maxHeight;
                final isCompact = availableHeight < 600;
                final isExtremelyConstrained = availableHeight < 200;

                // If extremely constrained, show only essential content
                if (isExtremelyConstrained) {
                  return SingleChildScrollView(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildHeroContent(context, isMobile),
                        const SizedBox(height: 16),
                        _buildSearchSection(context, isMobile),
                      ],
                    ),
                  );
                }

                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      flex: 2,
                      child: _buildHeroContent(context, isMobile),
                    ),
                    SizedBox(height: isCompact ? 16 : (isMobile ? 32 : 40)),
                    Flexible(
                      flex: 1,
                      child: _buildSearchSection(context, isMobile),
                    ),
                    SizedBox(height: isCompact ? 12 : (isMobile ? 24 : 32)),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 150),
                      child: _overlayOpen
                        ? const SizedBox.shrink()
                        : _buildActionButtons(context, isMobile),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroContent(BuildContext context, bool isMobile) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // If height is extremely constrained, show minimal content
        final isExtremelyConstrained = constraints.maxHeight < 50;

        if (isExtremelyConstrained) {
          return SizedBox(
            height: constraints.maxHeight,
            child: Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  'InsideLab',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.heroText,
                    fontFamily: 'Inter',
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          );
        }

        return Container(
          constraints: const BoxConstraints(maxWidth: 920),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Main Headline
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
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
                    maxLines: 2,
                  ),
                ),
              ),
              if (constraints.maxHeight > 100) ...[
                SizedBox(height: isMobile ? 16 : 24),
                // Subheading
                Flexible(
                  child: Container(
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
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildSearchSection(BuildContext context, bool isMobile) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final showHelpText = constraints.maxHeight > 80;

        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Search Bar
            SearchBarWidget(
              onOverlayChanged: (open) {
                if (mounted) setState(() => _overlayOpen = open);
              },
            ),
            if (showHelpText) ...[
              SizedBox(height: isMobile ? 8 : 16),
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
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ],
        );
      },
    );
  }

  Widget _buildActionButtons(BuildContext context, bool isMobile) {
    if (isMobile) {
      // Stack buttons vertically on mobile
      return Column(
        mainAxisSize: MainAxisSize.min,
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
        mainAxisSize: MainAxisSize.min,
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
      onPressed: () => context.go('/write-review'),
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
      onPressed: () => context.go('/services/mock-interview'),
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
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class CtaSection extends StatelessWidget {
  const CtaSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment(-0.5, -0.5),
          end: Alignment(0.5, 0.5),
          colors: [
            Color(0xFF7C3AED), // #7C3AED (purple)
            Color(0xFF2563EB), // #2563EB (blue)
          ],
        ),
      ),
      padding: EdgeInsets.symmetric(
        vertical: isMobile ? 80 : 112,
        horizontal: 24,
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            children: [
              _buildCtaContent(context, isMobile),
              SizedBox(height: isMobile ? 32 : 40),
              _buildCtaButtons(context, isMobile),
              SizedBox(height: isMobile ? 24 : 32),
              _buildBottomText(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCtaContent(BuildContext context, bool isMobile) {
    return Column(
      children: [
        Text(
          'Ready to Start Your Graduate School Journey?',
          style: TextStyle(
            fontSize: isMobile ? 32 : 48,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            height: 1.1,
            letterSpacing: -0.02,
            fontFamily: 'Inter',
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: isMobile ? 16 : 20),
        Container(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Text(
            'Join thousands of students who have successfully navigated their graduate school applications with our expert guidance and insider insights.',
            style: TextStyle(
              fontSize: isMobile ? 16 : 18,
              color: Colors.white.withOpacity(0.9),
              height: 1.5,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  Widget _buildCtaButtons(BuildContext context, bool isMobile) {
    if (isMobile) {
      return Column(
        children: [
          _buildPrimaryButton(context),
          const SizedBox(height: 16),
          _buildSecondaryButton(context),
        ],
      );
    } else {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildPrimaryButton(context),
          const SizedBox(width: 16),
          _buildSecondaryButton(context),
        ],
      );
    }
  }

  Widget _buildPrimaryButton(BuildContext context) {
    return ElevatedButton(
      onPressed: () => context.go('/sign-up'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2563EB),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
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
            return const Color(0xFF2563EB).withOpacity(0.05);
          }
          return Colors.transparent;
        }),
      ),
      child: const Text(
        'Get Started Free',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }

  Widget _buildSecondaryButton(BuildContext context) {
    return OutlinedButton(
      onPressed: () => context.go('/reviews'),
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(
          color: Colors.white,
          width: 2,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        backgroundColor: Colors.transparent,
      ).copyWith(
        backgroundColor: MaterialStateProperty.resolveWith<Color>((states) {
          if (states.contains(MaterialState.hovered)) {
            return Colors.white.withOpacity(0.1);
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
        'Browse Reviews',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
    );
  }

  Widget _buildBottomText(BuildContext context) {
    return Text(
      'No credit card required · Join 15,000+ students worldwide',
      style: TextStyle(
        fontSize: 14,
        color: Colors.white.withOpacity(0.7),
        fontFamily: 'Inter',
      ),
      textAlign: TextAlign.center,
    );
  }
}
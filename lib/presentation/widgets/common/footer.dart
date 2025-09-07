import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class Footer extends StatelessWidget {
  const Footer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;
    final isTablet = screenSize.width >= 768 && screenSize.width < 1024;

    return Container(
      color: AppColors.surface,
      padding: EdgeInsets.symmetric(
        vertical: isMobile ? 48 : 64,
        horizontal: 24,
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isMobile) ...[
                _buildMobileFooter(context),
              ] else if (isTablet) ...[
                _buildTabletFooter(context),
              ] else ...[
                _buildDesktopFooter(context),
              ],
              const SizedBox(height: 32),
              _buildBottomBar(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileFooter(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildBrandSection(context),
        const SizedBox(height: 32),
        _buildProductLinks(context),
        const SizedBox(height: 24),
        _buildCompanyLinks(context),
        const SizedBox(height: 24),
        _buildResourcesLinks(context),
        const SizedBox(height: 24),
        _buildSupportLinks(context),
      ],
    );
  }

  Widget _buildTabletFooter(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 2,
              child: _buildBrandSection(context),
            ),
            const SizedBox(width: 40),
            Expanded(
              child: _buildProductLinks(context),
            ),
            Expanded(
              child: _buildCompanyLinks(context),
            ),
          ],
        ),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(child: _buildResourcesLinks(context)),
            Expanded(child: _buildSupportLinks(context)),
          ],
        ),
      ],
    );
  }

  Widget _buildDesktopFooter(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: _buildBrandSection(context),
        ),
        const SizedBox(width: 64),
        Expanded(
          child: _buildProductLinks(context),
        ),
        Expanded(
          child: _buildCompanyLinks(context),
        ),
        Expanded(
          child: _buildResourcesLinks(context),
        ),
        Expanded(
          child: _buildSupportLinks(context),
        ),
      ],
    );
  }

  Widget _buildBrandSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Logo
        Text(
          'Insidelab',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 16),
        // Description
        Container(
          constraints: const BoxConstraints(maxWidth: 300),
          child: Text(
            'Your trusted partner for graduate school success. Get insider reviews, professional feedback, and expert guidance from students who made it.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.5,
              fontFamily: 'Inter',
            ),
          ),
        ),
        const SizedBox(height: 20),
        // Social Links
        Row(
          children: [
            _buildSocialIcon(context, Icons.email, '/contact'),
            const SizedBox(width: 12),
            _buildSocialIcon(context, Icons.school, '/about'),
            const SizedBox(width: 12),
            _buildSocialIcon(context, Icons.help_outline, '/faq'),
          ],
        ),
      ],
    );
  }

  Widget _buildSocialIcon(BuildContext context, IconData icon, String route) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, route),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 20,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildProductLinks(BuildContext context) {
    return _buildFooterSection(
      context,
      'Product',
      [
        {'title': 'Professor Reviews', 'route': '/'},
        {'title': 'CV Feedback', 'route': '/cv-review'},
        {'title': 'Mock Interviews', 'route': '/mock-interview'},
        {'title': 'Application Services', 'route': '/application-services'},
      ],
    );
  }

  Widget _buildCompanyLinks(BuildContext context) {
    return _buildFooterSection(
      context,
      'Company',
      [
        {'title': 'About Us', 'route': '/about'},
        {'title': 'Success Stories', 'route': '/success-stories'},
        {'title': 'Careers', 'route': '/careers'},
        {'title': 'Contact', 'route': '/contact'},
      ],
    );
  }

  Widget _buildResourcesLinks(BuildContext context) {
    return _buildFooterSection(
      context,
      'Resources',
      [
        {'title': 'Blog', 'route': '/blog'},
        {'title': 'Guides', 'route': '/guides'},
        {'title': 'FAQ', 'route': '/faq'},
        {'title': 'Help Center', 'route': '/help'},
      ],
    );
  }

  Widget _buildSupportLinks(BuildContext context) {
    return _buildFooterSection(
      context,
      'Support',
      [
        {'title': 'Privacy Policy', 'route': '/privacy'},
        {'title': 'Terms of Service', 'route': '/terms'},
        {'title': 'Cookie Policy', 'route': '/cookies'},
        {'title': 'Community Guidelines', 'route': '/guidelines'},
      ],
    );
  }

  Widget _buildFooterSection(BuildContext context, String title, List<Map<String, String>> links) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 16),
        ...links.map((link) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () => Navigator.pushNamed(context, link['route']!),
            borderRadius: BorderRadius.circular(4),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
              child: Text(
                link['title']!,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontFamily: 'Inter',
                ),
              ),
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;
    
    return Container(
      padding: const EdgeInsets.only(top: 24),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.border,
            width: 1,
          ),
        ),
      ),
      child: isMobile 
        ? Column(
            children: [
              Text(
                '© 2024 Insidelab. All rights reserved.',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontFamily: 'Inter',
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Made with ❤️ for graduate students',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  fontFamily: 'Inter',
                ),
                textAlign: TextAlign.center,
              ),
            ],
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  '© 2024 Insidelab. All rights reserved.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
              Flexible(
                child: Text(
                  'Made with ❤️ for graduate students',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    fontFamily: 'Inter',
                  ),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
    );
  }
}
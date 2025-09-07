import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class TrustedMetricsSection extends StatelessWidget {
  const TrustedMetricsSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isMobile = screenSize.width < 768;

    return Container(
      color: AppColors.metricsBackground,
      padding: EdgeInsets.symmetric(
        vertical: 72,
        horizontal: isMobile ? 24 : 48,
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              _buildSectionHeader(isMobile),
              SizedBox(height: isMobile ? 40 : 48),
              isMobile
                  ? Column(
                      children: _buildMetricCards(isMobile),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: _buildMetricCards(isMobile),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(bool isMobile) {
    return Column(
      children: [
        Text(
          'Trusted by Students Worldwide',
          style: TextStyle(
            fontSize: isMobile ? 28 : 36,
            fontWeight: FontWeight.w800,
            color: AppColors.metricsText,
            fontFamily: 'Inter',
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: isMobile ? 12 : 16),
        Text(
          'Join thousands of successful graduate school applicants',
          style: TextStyle(
            fontSize: isMobile ? 16 : 18,
            color: AppColors.metricsSubtext,
            fontFamily: 'Inter',
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  List<Widget> _buildMetricCards(bool isMobile) {
    final metrics = [
      {
        'icon': Icons.school,
        'number': '15,000+',
        'label': 'Graduate Programs Reviewed',
      },
      {
        'icon': Icons.emoji_events,
        'number': '3,200+',
        'label': 'Successful Applicants',
      },
      {
        'icon': Icons.location_city,
        'number': '500+',
        'label': 'Universities Covered',
      },
      {
        'icon': Icons.trending_up,
        'number': '98%',
        'label': 'Success Rate',
      },
    ];

    return metrics.asMap().entries.map((entry) {
      final index = entry.key;
      final metric = entry.value;
      
      return Container(
        margin: EdgeInsets.only(
          bottom: isMobile && index < metrics.length - 1 ? 32 : 0,
        ),
        child: _buildMetricCard(
          icon: metric['icon'] as IconData,
          number: metric['number'] as String,
          label: metric['label'] as String,
        ),
      );
    }).toList();
  }

  Widget _buildMetricCard({
    required IconData icon,
    required String number,
    required String label,
  }) {
    return Column(
      children: [
        // Icon with circular background
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            size: 28,
            color: AppColors.metricsText,
          ),
        ),
        const SizedBox(height: 16),
        
        // Number
        Text(
          number,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            color: AppColors.metricsText,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 8),
        
        // Label
        Container(
          constraints: const BoxConstraints(maxWidth: 200),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.metricsSubtext,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }
}
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';

class ApplicationServicesScreen extends StatelessWidget {
  const ApplicationServicesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(),
            _buildServicesList(context),
            _buildWhyChooseUs(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '🎓 Graduate School Application Services',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Get personalized help from successful graduate students who\'ve been through the process',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatCard('500+', 'Students Helped'),
              const SizedBox(width: 16),
              _buildStatCard('4.8★', 'Average Rating'),
              const SizedBox(width: 16),
              _buildStatCard('95%', 'Success Rate'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String value, String label) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServicesList(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Our Services',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 20),
          _buildServiceCard(
            context,
            icon: Icons.description,
            title: 'CV/Resume Review',
            description: 'Get your academic CV reviewed by successful PhD students in your field',
            features: [
              'Detailed feedback on content and formatting',
              'Field-specific suggestions',
              'Before/after comparison',
              '48-hour turnaround'
            ],
            price: '\$25-35',
            onTap: () => Navigator.pushNamed(context, '/cv-review'),
          ),
          _buildServiceCard(
            context,
            icon: Icons.edit_note,
            title: 'Statement of Purpose Editing',
            description: 'Professional editing and feedback on your personal statement',
            features: [
              'Line-by-line editing and suggestions',
              'Structure and flow improvements',
              'University-specific customization',
              'Multiple revision rounds'
            ],
            price: '\$40-60',
            onTap: () => Navigator.pushNamed(context, '/sop-editing'),
          ),
          _buildServiceCard(
            context,
            icon: Icons.video_call,
            title: 'Mock Interviews',
            description: 'Practice interviews with current PhD students',
            features: [
              '1-hour live video session',
              'Field-specific questions',
              'Detailed feedback report',
              'Recording for self-review'
            ],
            price: '\$30-50',
            onTap: () => Navigator.pushNamed(context, '/mock-interview'),
          ),
          _buildServiceCard(
            context,
            icon: Icons.timeline,
            title: 'Application Timeline Manager',
            description: 'Stay organized with personalized deadline tracking',
            features: [
              'Custom timeline for each application',
              'Automated reminders',
              'Progress tracking',
              'Document checklist'
            ],
            price: 'Free',
            onTap: () => Navigator.pushNamed(context, '/timeline-manager'),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String description,
    required List<String> features,
    required String price,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      price,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Column(
                children: features.map((feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, 
                           size: 16, 
                           color: AppColors.success),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          feature,
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                )).toList(),
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  child: Text('Get Started'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWhyChooseUs() {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.success.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.star, color: AppColors.success),
              const SizedBox(width: 8),
              Text(
                'Why Choose Our Services?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildBenefitItem('🎯', 'Personalized Approach', 
                            'Every service is tailored to your specific field and goals'),
          _buildBenefitItem('👥', 'Peer Mentorship', 
                            'Learn from current PhD students who understand the process'),
          _buildBenefitItem('⚡', 'Quick Turnaround', 
                            'Fast, efficient service without compromising quality'),
          _buildBenefitItem('🔒', 'Confidential & Secure', 
                            'Your documents and information are completely confidential'),
        ],
      ),
    );
  }

  Widget _buildBenefitItem(String emoji, String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
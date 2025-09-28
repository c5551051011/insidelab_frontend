// presentation/screens/lab_detail/widgets/publications_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/publication.dart';
import 'package:url_launcher/url_launcher.dart';

class PublicationsWidget extends StatefulWidget {
  final String labId;

  const PublicationsWidget({
    Key? key,
    required this.labId,
  }) : super(key: key);

  @override
  State<PublicationsWidget> createState() => _PublicationsWidgetState();
}

class _PublicationsWidgetState extends State<PublicationsWidget> {
  String selectedFilter = 'All';
  final List<String> filters = ['All', 'Top-tier', 'Robotics', 'Control Systems', '2024'];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Text(
                  '📚',
                  style: TextStyle(fontSize: 20),
                ),
                SizedBox(width: 8),
                Text(
                  'Research Publications',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildPublicationStats(),
            const SizedBox(height: 24),
            _buildFilters(),
            const SizedBox(height: 20),
            _buildPublicationsList(),
            const SizedBox(height: 16),
            _buildViewAllButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildPublicationStats() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFf0f9ff), Color(0xFFe0f2fe)],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF0ea5e9)),
      ),
      child: Row(
        children: [
          Expanded(child: _buildStatItem('2,847', 'Total Citations')),
          Expanded(child: _buildStatItem('34', 'H-Index')),
          Expanded(child: _buildStatItem('156', 'Publications')),
          Expanded(child: _buildStatItem('12', 'This Year')),
        ],
      ),
    );
  }

  Widget _buildStatItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0369a1),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF64748b),
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFilters() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: filters.map((filter) {
        final isActive = filter == selectedFilter;
        return GestureDetector(
          onTap: () {
            setState(() {
              selectedFilter = filter;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isActive ? AppColors.primary : const Color(0xFFf1f5f9),
              border: Border.all(
                color: isActive ? AppColors.primary : const Color(0xFFe2e8f0),
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              filter,
              style: TextStyle(
                fontSize: 13,
                color: isActive ? Colors.white : const Color(0xFF64748b),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPublicationsList() {
    return Column(
      children: [
        _buildPublicationItem(
          venue: 'ICRA 2024',
          isTopTier: true,
          year: '2024',
          title: 'Haptic-Enabled Robotic Manipulation in Unstructured Environments',
          authors: ['Sarah Chen', 'Michael Johnson', 'Oussama Khatib'],
          labAuthors: ['Sarah Chen', 'Oussama Khatib'],
          citations: 42,
          githubStars: 234,
          award: 'Best Paper Award',
          abstract: 'This paper presents a novel approach for haptic-enabled robotic manipulation in unstructured environments. Our method combines advanced force feedback with real-time visual processing to enable precise object manipulation in complex scenarios...',
          tags: ['Robotics', 'Haptic Technology', 'Manipulation'],
          links: {
            'Paper': '#',
            'Code': '#',
            'Video': '#',
          },
        ),
        const SizedBox(height: 16),
        _buildPublicationItem(
          venue: 'IEEE Robotics',
          isTopTier: false,
          year: '2024',
          title: 'Multi-Robot Coordination for Dynamic Task Allocation',
          authors: ['Alex Rodriguez', 'Oussama Khatib', 'David Wilson'],
          labAuthors: ['Alex Rodriguez', 'Oussama Khatib'],
          citations: 28,
          githubStars: 156,
          abstract: 'We propose a distributed algorithm for multi-robot coordination that enables dynamic task allocation in real-time. The approach demonstrates significant improvements in efficiency and adaptability compared to existing methods...',
          tags: ['Multi-Robot Systems', 'Task Allocation', 'Coordination'],
          links: {
            'Paper': '#',
            'Code': '#',
          },
        ),
      ],
    );
  }

  Widget _buildPublicationItem({
    required String venue,
    required bool isTopTier,
    required String year,
    required String title,
    required List<String> authors,
    required List<String> labAuthors,
    required int citations,
    int? githubStars,
    String? award,
    required String abstract,
    required List<String> tags,
    required Map<String, String> links,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isTopTier ? const Color(0xFFf59e0b) : const Color(0xFF10b981),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  venue,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                year,
                style: const TextStyle(
                  color: Color(0xFF6b7280),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 8),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF6b7280),
              ),
              children: authors.map((author) {
                final isLabAuthor = labAuthors.contains(author);
                return TextSpan(
                  text: author == authors.last ? author : '$author, ',
                  style: TextStyle(
                    color: isLabAuthor ? AppColors.primary : const Color(0xFF6b7280),
                    fontWeight: isLabAuthor ? FontWeight.w500 : FontWeight.normal,
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            children: [
              _buildMetric('📈', '$citations citations'),
              if (githubStars != null) _buildMetric('⭐', '$githubStars GitHub stars'),
              if (award != null) _buildMetric('🏆', award),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            abstract,
            style: const TextStyle(
              color: Color(0xFF4b5563),
              fontSize: 14,
              height: 1.5,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: tags.map((tag) => _buildTag(tag)).toList(),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: links.entries.map((entry) {
              return GestureDetector(
                onTap: () => _launchUrl(entry.value),
                child: Text(
                  '${_getIcon(entry.key)} ${entry.key}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(icon, style: const TextStyle(fontSize: 12)),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF6b7280),
          ),
        ),
      ],
    );
  }

  Widget _buildTag(String tag) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFf3f4f6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        tag,
        style: const TextStyle(
          color: Color(0xFF374151),
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildViewAllButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFf8fafc),
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Text(
        'View All Publications (154 more)',
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.w500,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  String _getIcon(String linkType) {
    switch (linkType.toLowerCase()) {
      case 'paper':
        return '📄';
      case 'code':
        return '💻';
      case 'video':
        return '🎥';
      default:
        return '🔗';
    }
  }

  void _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }
}
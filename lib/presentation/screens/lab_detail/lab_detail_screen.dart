// presentation/screens/lab_detail/lab_detail_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../services/lab_service.dart';
import '../../widgets/common/header_navigation.dart';
import 'widgets/lab_header.dart';
import 'widgets/rating_breakdown.dart';
import 'widgets/reviews_list.dart';
import 'widgets/publications_widget.dart';
import 'widgets/lab_information_widget.dart';
import 'package:url_launcher/url_launcher.dart';

class LabDetailScreen extends StatefulWidget {
  final Lab lab;

  const LabDetailScreen({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  State<LabDetailScreen> createState() => _LabDetailScreenState();
}

class _LabDetailScreenState extends State<LabDetailScreen> {
  Map<String, double>? _ratingBreakdown;
  bool _isLoadingRatings = true;
  late final Widget _publicationsWidget;
  final GlobalKey _publicationsKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _publicationsWidget = PublicationsWidget(
      key: _publicationsKey,
      labId: widget.lab.id,
      lab: widget.lab,
    );
    _loadRatingBreakdown();
  }

  Future<void> _loadRatingBreakdown() async {
    try {
      final averages = await LabService.getLabAverages(widget.lab.id);
      if (averages != null && mounted) {
        setState(() {
          _ratingBreakdown = _convertToRatingBreakdown(averages);
          _isLoadingRatings = false;
        });
      } else {
        // Fallback to static data if backend doesn't return data
        setState(() {
          _ratingBreakdown = _getStaticRatingBreakdown();
          _isLoadingRatings = false;
        });
      }
    } catch (e) {
      print('Error loading rating breakdown: $e');
      if (mounted) {
        setState(() {
          _ratingBreakdown = _getStaticRatingBreakdown();
          _isLoadingRatings = false;
        });
      }
    }
  }

  Map<String, double> _convertToRatingBreakdown(Map<String, dynamic> averages) {
    // Convert backend response to rating breakdown format
    return {
      'Mentorship Quality': (averages['mentorship_quality'] ?? widget.lab.overallRating).toDouble(),
      'Research Environment': (averages['research_environment'] ?? widget.lab.overallRating).toDouble(),
      'Work-Life Balance': (averages['work_life_balance'] ?? widget.lab.overallRating).toDouble(),
      'Career Support': (averages['career_support'] ?? widget.lab.overallRating).toDouble(),
      'Funding & Resources': (averages['funding_resources'] ?? widget.lab.overallRating).toDouble(),
      'Collaboration Culture': (averages['collaboration_culture'] ?? widget.lab.overallRating).toDouble(),
    };
  }

  Map<String, double> _getStaticRatingBreakdown() {
    // Static data based on overall rating, but consistent (not changing with window size)
    final baseRating = widget.lab.overallRating;
    return {
      'Mentorship Quality': _adjustRating(baseRating, 0.2),
      'Research Environment': _adjustRating(baseRating, -0.1),
      'Work-Life Balance': _adjustRating(baseRating, -0.3),
      'Career Support': _adjustRating(baseRating, 0.1),
      'Funding & Resources': _adjustRating(baseRating, 0.0),
      'Collaboration Culture': _adjustRating(baseRating, 0.2),
    };
  }

  double _adjustRating(double baseRating, double adjustment) {
    final adjusted = baseRating + adjustment;
    return adjusted.clamp(1.0, 5.0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            LabHeader(lab: widget.lab),
            const SizedBox(height: 24),
            _buildContent(context),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 1000) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left Column: Lab Info + Recruitment Status + Publications
                Expanded(
                  flex: 3,
                  child: Column(
                    children: [
                      LabInformationWidget(lab: widget.lab),
                      const SizedBox(height: 24),
                      _publicationsWidget,
                    ],
                  ),
                ),
                const SizedBox(width: 24),
                // Right Column: Rating Breakdown + Reviews
                Expanded(
                  flex: 2,
                  child: Column(
                    children: [
                      // Always show rating breakdown with sample data if real data is not available
                      _isLoadingRatings
                          ? const Center(child: CircularProgressIndicator())
                          : RatingBreakdown(ratings: _ratingBreakdown ?? {}),
                      const SizedBox(height: 24),
                      ReviewsList(labId: widget.lab.id),
                    ],
                  ),
                ),
              ],
            );
          } else {
            return Column(
              children: [
                LabInformationWidget(lab: widget.lab),
                const SizedBox(height: 24),
                _publicationsWidget,
                const SizedBox(height: 24),
                // Always show rating breakdown with sample data if real data is not available
                _isLoadingRatings
                    ? const Center(child: CircularProgressIndicator())
                    : RatingBreakdown(ratings: _ratingBreakdown ?? {}),
                const SizedBox(height: 24),
                ReviewsList(labId: widget.lab.id),
              ],
            );
          }
        },
      ),
    );
  }

  /*
  Widget _buildRadarChart() {
    if (widget.lab.ratingBreakdown == null) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Rating Overview',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            Center(
              child: RatingRadarChart(
                ratings: widget.lab.ratingBreakdown!,
                size: 250,
              ),
            ),
          ],
        ),
      ),
    );
  }
*/

  Widget _buildRecruitmentStatus() {
    if (widget.lab.recruitmentStatus == null) return const SizedBox.shrink();

    final status = widget.lab.recruitmentStatus!;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recruitment Status',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (status.lastUpdated != null)
                  Text(
                    'Updated ${_formatDate(status.lastUpdated!)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _buildRecruitmentItem('PhD Students', status.isRecruitingPhD),
            _buildRecruitmentItem('Postdocs', status.isRecruitingPostdoc),
            _buildRecruitmentItem('Undergraduate Interns', status.isRecruitingIntern),
            if (status.notes != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.info.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: AppColors.info),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        status.notes!,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecruitmentItem(String position, bool isRecruiting) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            isRecruiting ? Icons.check_circle : Icons.cancel,
            color: isRecruiting ? AppColors.success : AppColors.textTertiary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            position,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isRecruiting
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.textTertiary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              isRecruiting ? 'Open' : 'Closed',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isRecruiting ? AppColors.success : AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }


  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()} weeks ago';
    } else {
      return '${(difference.inDays / 30).floor()} months ago';
    }
  }

  Widget _buildLabInfo() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lab Information',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (widget.lab.description != null) ...[
              Text(widget.lab.description!),
              const SizedBox(height: 16),
            ],
            _buildInfoRow('Department', widget.lab.department),
            if (widget.lab.hasResearchGroup)
              _buildInfoRow('Research Group', widget.lab.researchGroupName!),
            _buildInfoRow('Lab Size', '${widget.lab.labSize ?? "Unknown"} members'),
            if (widget.lab.website != null)
              _buildInfoRow('Website', widget.lab.website!, isLink: true),
            const SizedBox(height: 16),
            const Text(
              'Research Areas',
              style: TextStyle(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.lab.researchAreas.map((area) {
                return Chip(
                  label: Text(area),
                  backgroundColor: AppColors.primaryLight.withOpacity(0.1),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),
            _buildReportIssueSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isLink = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: isLink
                ? InkWell(
                    onTap: () => _launchUrl(value),
                    child: Text(
                      value,
                      style: const TextStyle(
                        color: AppColors.primary,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  )
                : Text(value),
          ),
        ],
      ),
    );
  }


  Widget _buildReportIssueSection() {
    return Builder(
      builder: (context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.report_outlined,
                size: 20,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 8),
              const Text(
                'Found incorrect information?',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Help us improve lab information accuracy. Report issues with department, website, research areas, recruitment status, or any other details.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => _showReportIssueDialog(context),
            icon: const Icon(Icons.email_outlined, size: 18),
            label: const Text('Report Information Issue'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: BorderSide(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  void _showReportIssueDialog(BuildContext context) {
    final issueController = TextEditingController();
    final correctionController = TextEditingController();
    final sourceController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.report_outlined, color: AppColors.primary),
            const SizedBox(width: 8),
            const Text('Report Information Issue'),
          ],
        ),
        content: SizedBox(
          width: 500,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Lab: ${widget.lab.name}', style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text('Professor: ${widget.lab.professorName}', style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text('University: ${widget.lab.universityName}', style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'What information is incorrect?',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: issueController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'Describe what information is wrong (e.g., "Department should be Computer Science, not Electrical Engineering")',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'What is the correct information?',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: correctionController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'Provide the correct information',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Source/Verification (optional)',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: sourceController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    hintText: 'Source of the correct information (e.g., official website, lab page)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              if (issueController.text.trim().isNotEmpty) {
                _sendCorrectionEmail(
                  context,
                  issueController.text.trim(),
                  correctionController.text.trim(),
                  sourceController.text.trim(),
                );
                Navigator.pop(context);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please describe what information is incorrect.'),
                    backgroundColor: Colors.orange,
                  ),
                );
              }
            },
            icon: const Icon(Icons.send, size: 16),
            label: const Text('Send Report'),
          ),
        ],
      ),
    );
  }

  Future<void> _sendCorrectionEmail(BuildContext context, String issue, String correction, String source) async {
    final subject = Uri.encodeComponent('Lab Information Correction - ${widget.lab.name}');
    final body = Uri.encodeComponent(
      'Lab Information Correction Request\n\n'
      'Lab Name: ${widget.lab.name}\n'
      'Professor: ${widget.lab.professorName}\n'
      'University: ${widget.lab.universityName}\n'
      'Department: ${widget.lab.department}\n'
      '${widget.lab.hasResearchGroup ? 'Research Group: ${widget.lab.researchGroupName}\n' : ''}\n'
      'Issue Description:\n$issue\n\n'
      'Correct Information:\n$correction\n\n'
      '${source.isNotEmpty ? 'Source/Verification:\n$source\n\n' : ''}'
      'Thank you for helping improve InsideLab!'
    );

    final emailUrl = Uri.parse('mailto:insidelab25@gmail.com?subject=$subject&body=$body');

    try {
      if (await canLaunchUrl(emailUrl)) {
        await launchUrl(emailUrl);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Opening email client...'),
              backgroundColor: AppColors.success,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        throw 'Could not launch email client';
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Please email insidelab25@gmail.com with the correction details.'),
            backgroundColor: AppColors.warning,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    // Ensure URL has proper protocol
    String formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://$url';
    }

    final uri = Uri.parse(formattedUrl);

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw 'Could not launch $formattedUrl';
      }
    } catch (e) {
      print('Error launching URL: $e');
    }
  }
}

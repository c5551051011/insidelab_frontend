// presentation/screens/lab_detail/widgets/lab_information_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../widgets/common/card_widget.dart';
import 'package:url_launcher/url_launcher.dart';

class LabInformationWidget extends StatelessWidget {
  final Lab lab;

  const LabInformationWidget({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardTitle(
            title: 'Lab Information',
            icon: 'ℹ️',
          ),
          const SizedBox(height: 16),
          if (lab.description != null) ...[
            Text(
              lab.description!,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
          ],
          if (lab.hasResearchGroup)
            _buildInfoRow('Research Group', lab.researchGroupName!),
          _buildLabSizeRow(),
          if (lab.website != null)
            _buildInfoRow('Website', lab.website!, isLink: true),
          if (lab.recruitmentStatus != null) ...[
            const SizedBox(height: 20),
            _buildRecruitmentStatusSection(),
          ],
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),
          _buildReportIssueSection(context),
        ],
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
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6b7280),
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
                        fontSize: 14,
                        color: Color(0xFF3b82f6),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(fontSize: 14),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabSizeRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              'Lab Size',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6b7280),
              ),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (lab.labSize != null) ...[
                  Text(
                    'Total: ${lab.labSize} members',
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                ],
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _buildLabSizeItem('Undergraduate', 3, const Color(0xFF3b82f6)),
                    _buildLabSizeItem('PhD Students', 5, const Color(0xFF10b981)),
                    _buildLabSizeItem('Postdocs', 2, const Color(0xFFf59e0b)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabSizeItem(String degree, int count, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          '$degree: $count',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildReportIssueSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.report_outlined,
              size: 20,
              color: Color(0xFF6b7280),
            ),
            const SizedBox(width: 8),
            const Text(
              'Found incorrect information?',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1f2937),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Help us improve lab information accuracy. Report issues with department, website, research areas, recruitment status, or any other details.',
          style: const TextStyle(
            color: Color(0xFF6b7280),
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => _showReportIssueDialog(context),
          icon: const Icon(Icons.email_outlined, size: 18),
          label: const Text(
            'Report Information Issue',
            style: TextStyle(fontSize: 14),
          ),
          style: OutlinedButton.styleFrom(
            foregroundColor: Color(0xFF3b82f6),
            side: BorderSide(color: Color(0xFF3b82f6)),
          ),
        ),
      ],
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
            Icon(Icons.report_outlined, color: Color(0xFF3b82f6)),
            const SizedBox(width: 8),
            const Text('Report Information Issue'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Help us maintain accurate lab information by reporting any issues you\'ve found.',
                style: TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: issueController,
                decoration: const InputDecoration(
                  labelText: 'What information is incorrect?',
                  hintText: 'e.g., Website URL is broken, Department is wrong...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: correctionController,
                decoration: const InputDecoration(
                  labelText: 'What should it be? (optional)',
                  hintText: 'Provide the correct information if you know it',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: sourceController,
                decoration: const InputDecoration(
                  labelText: 'Source (optional)',
                  hintText: 'Where did you find the correct information?',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (issueController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please describe the issue'),
                    backgroundColor: Colors.red,
                  ),
                );
                return;
              }

              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Thank you! Your report has been submitted.'),
                  backgroundColor: Color(0xFF10b981),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF3b82f6),
            ),
            child: const Text('Submit Report'),
          ),
        ],
      ),
    );
  }

  Widget _buildRecruitmentStatusSection() {
    final status = lab.recruitmentStatus!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recruitment Status',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1f2937),
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
        const SizedBox(height: 12),
        _buildRecruitmentItem('PhD Students', status.isRecruitingPhD),
        _buildRecruitmentItem('Postdocs', status.isRecruitingPostdoc),
        _buildRecruitmentItem('Undergraduate Interns', status.isRecruitingIntern),
        if (status.notes != null) ...[
          const SizedBox(height: 12),
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
    );
  }

  Widget _buildRecruitmentItem(String position, bool isRecruiting) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(
            isRecruiting ? Icons.check_circle : Icons.cancel,
            color: isRecruiting ? AppColors.success : AppColors.textTertiary,
            size: 18,
          ),
          const SizedBox(width: 12),
          Text(
            position,
            style: const TextStyle(fontSize: 14),
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

    if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else {
      return 'Today';
    }
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
// presentation/screens/lab_detail/widgets/lab_information_widget.dart
import 'package:flutter/material.dart';
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
            Text(lab.description!),
            const SizedBox(height: 16),
          ],
          _buildInfoRow('Department', lab.department),
          if (lab.hasResearchGroup)
            _buildInfoRow('Research Group', lab.researchGroupName!),
          _buildInfoRow('Lab Size', '${lab.labSize ?? "Unknown"} members'),
          if (lab.website != null)
            _buildInfoRow('Website', lab.website!, isLink: true),
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
            children: lab.researchAreas.map((area) {
              return Chip(
                label: Text(area),
                backgroundColor: Color(0xFF3b82f6).withOpacity(0.1),
              );
            }).toList(),
          ),
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
                        color: Color(0xFF3b82f6),
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
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Help us improve lab information accuracy. Report issues with department, website, research areas, recruitment status, or any other details.',
          style: TextStyle(
            color: Color(0xFF6b7280),
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => _showReportIssueDialog(context),
          icon: const Icon(Icons.email_outlined, size: 18),
          label: const Text('Report Information Issue'),
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

  void _launchUrl(String url) async {
    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
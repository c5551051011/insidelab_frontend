// presentation/screens/lab_detail/widgets/lab_information_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../widgets/common/card_widget.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../services/api_service.dart';

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

  void _showReportIssueDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => ReportIssueDialog(lab: lab),
    );
  }
}

class ReportIssueDialog extends StatefulWidget {
  final Lab lab;

  const ReportIssueDialog({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  State<ReportIssueDialog> createState() => _ReportIssueDialogState();
}

class _ReportIssueDialogState extends State<ReportIssueDialog> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  String _selectedIssueType = 'Incorrect Information';
  final List<String> _issueTypes = [
    'Incorrect Information',
    'Outdated Information',
    'Missing Information',
    'Website Link Issue',
    'Contact Information Issue',
    'Other',
  ];

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 700),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.report_outlined,
                  color: AppColors.warning,
                  size: 24,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Report Information Issue',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Lab Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lab.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${widget.lab.professorName} • ${widget.lab.universityName}',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Expanded(
              child: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Issue Type Selection
                      const Text(
                        'Issue Type',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedIssueType,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        items: _issueTypes.map((type) {
                          return DropdownMenuItem(
                            value: type,
                            child: Text(type),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedIssueType = value!;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      // Email Field
                      const Text(
                        'Your Email (Optional)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          hintText: 'your-email@example.com',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          prefixIcon: const Icon(Icons.email_outlined),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(value)) {
                              return 'Please enter a valid email address';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Message Field
                      const Text(
                        'Issue Description',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _messageController,
                        decoration: InputDecoration(
                          hintText: 'Please describe the issue with this lab\'s information...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignLabelWithHint: true,
                        ),
                        maxLines: 5,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please describe the issue';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Help Text
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.info.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: AppColors.info.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: AppColors.info,
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Help us improve lab information accuracy. We will review your report and make necessary updates.',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _isSubmitting || _messageController.text.trim().isEmpty
                      ? null
                      : _submitReport,
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send, size: 18),
                  label: Text(_isSubmitting ? 'Sending...' : 'Submit Report'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final labContext = '''
Lab Information:
- Lab Name: ${widget.lab.name}
- Professor: ${widget.lab.professorName}
- University: ${widget.lab.universityName}
- Department: ${widget.lab.department}
${widget.lab.hasResearchGroup ? '- Research Group: ${widget.lab.researchGroupName}' : ''}
- Lab ID: ${widget.lab.id}
- Lab URL: ${widget.lab.website ?? 'N/A'}
''';

      final message = '''
Issue Type: $_selectedIssueType

Issue Description:
${_messageController.text.trim()}

$labContext
''';

      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/feedback/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': _emailController.text.trim().isEmpty
              ? 'anonymous@insidelab.com'
              : _emailController.text.trim(),
          'name': _emailController.text.trim().isEmpty
              ? 'Anonymous User'
              : 'Lab Information Reporter',
          'subject': '[Lab Information Issue] ${widget.lab.name}',
          'message': message,
        }),
      );

      if (mounted) {
        Navigator.pop(context);

        if (response.statusCode == 200 || response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Thank you for your report! We will review the information and make necessary updates.'),
              backgroundColor: AppColors.success,
              duration: const Duration(seconds: 4),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Failed to submit report. Please try again.'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
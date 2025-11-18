// services/feedback_service.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'api_service.dart';

enum FeedbackType {
  performance('Performance', 'Performance issues and slow loading', Icons.speed),
  feature('Feature Request', 'New features and improvements', Icons.lightbulb_outline),
  bug('Bug Report', 'Something is not working correctly', Icons.bug_report_outlined),
  information('Information Issue', 'Incorrect or outdated information', Icons.report_outlined),
  ui('UI/UX', 'User interface and design feedback', Icons.design_services_outlined),
  other('Other', 'General feedback and suggestions', Icons.chat_bubble_outline);

  const FeedbackType(this.title, this.description, this.icon);

  final String title;
  final String description;
  final IconData icon;
}

class FeedbackService {
  /// Send feedback via backend API
  static Future<bool> sendFeedback({
    required FeedbackType feedbackType,
    required String message,
    String? userEmail,
    String? additionalContext,
    Map<String, dynamic>? userInfo,
  }) async {
    try {
      final subject = '[${feedbackType.title}] User Feedback';

      final body = _buildEmailBody(
        feedbackType: feedbackType,
        message: message,
        userEmail: userEmail,
        additionalContext: additionalContext,
        userInfo: userInfo,
      );

      // Determine user name and email
      String senderEmail = userEmail ?? 'anonymous@insidelab.com';
      String senderName = 'Anonymous User';

      if (userInfo != null) {
        senderEmail = userInfo['userEmail'] ?? userEmail ?? 'anonymous@insidelab.com';
        senderName = userInfo['userName'] ?? 'Anonymous User';
      }

      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/feedback/'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': senderEmail,
          'name': senderName,
          'subject': subject,
          'message': body,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        print('Error sending feedback: ${errorData['error'] ?? 'Unknown error'}');
        return false;
      }
    } catch (e) {
      print('Error sending feedback: $e');
      return false;
    }
  }

  /// Build email body with proper formatting
  static String _buildEmailBody({
    required FeedbackType feedbackType,
    required String message,
    String? userEmail,
    String? additionalContext,
    Map<String, dynamic>? userInfo,
  }) {
    final buffer = StringBuffer();

    buffer.writeln('Feedback Type: ${feedbackType.title}');
    buffer.writeln('');

    // User Information Section
    buffer.writeln('=== USER INFORMATION ===');

    if (userEmail != null && userEmail.isNotEmpty) {
      buffer.writeln('Contact Email: $userEmail');
    }

    if (userInfo != null) {
      if (userInfo['userId'] != null) {
        buffer.writeln('User ID: ${userInfo['userId']}');
      }
      if (userInfo['userName'] != null) {
        buffer.writeln('User Name: ${userInfo['userName']}');
      }
      if (userInfo['userEmail'] != null && userInfo['userEmail'] != userEmail) {
        buffer.writeln('Account Email: ${userInfo['userEmail']}');
      }
      if (userInfo['isVerified'] != null) {
        buffer.writeln('Account Verified: ${userInfo['isVerified'] ? 'Yes' : 'No'}');
      }
      if (userInfo['accountType'] != null) {
        buffer.writeln('Account Type: ${userInfo['accountType']}');
      }
      if (userInfo['registrationDate'] != null) {
        buffer.writeln('Registration Date: ${userInfo['registrationDate']}');
      }
    } else {
      buffer.writeln('User: Anonymous/Not logged in');
    }
    buffer.writeln('');

    buffer.writeln('Message:');
    buffer.writeln(message);
    buffer.writeln('');

    if (additionalContext != null && additionalContext.isNotEmpty) {
      buffer.writeln('Additional Context:');
      buffer.writeln(additionalContext);
      buffer.writeln('');
    }

    buffer.writeln('=== SYSTEM INFORMATION ===');
    buffer.writeln('Platform: ${defaultTargetPlatform.name}');
    buffer.writeln('App Mode: ${kDebugMode ? 'Debug' : 'Release'}');
    buffer.writeln('Flutter Version: ${kIsWeb ? 'Web' : 'Mobile/Desktop'}');
    buffer.writeln('Timestamp: ${DateTime.now().toIso8601String()}');
    buffer.writeln('');
    buffer.writeln('---');
    buffer.writeln('Sent from InsideLab App');

    return buffer.toString();
  }


  /// Show feedback dialog
  static Future<void> showFeedbackDialog(BuildContext context, {
    FeedbackType? initialType,
    String? additionalContext,
    Map<String, dynamic>? userInfo,
  }) async {
    return showDialog(
      context: context,
      builder: (context) => FeedbackDialog(
        initialType: initialType,
        additionalContext: additionalContext,
        userInfo: userInfo,
      ),
    );
  }
}

class FeedbackDialog extends StatefulWidget {
  final FeedbackType? initialType;
  final String? additionalContext;
  final Map<String, dynamic>? userInfo;

  const FeedbackDialog({
    Key? key,
    this.initialType,
    this.additionalContext,
    this.userInfo,
  }) : super(key: key);

  @override
  State<FeedbackDialog> createState() => _FeedbackDialogState();
}

class _FeedbackDialogState extends State<FeedbackDialog> {
  late FeedbackType _selectedType;
  final _messageController = TextEditingController();
  final _emailController = TextEditingController();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _selectedType = widget.initialType ?? FeedbackType.other;
  }

  @override
  void dispose() {
    _messageController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 600),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.feedback_outlined,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Send Feedback',
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
            const SizedBox(height: 20),

            // Feedback Type Selection
            const Text(
              'Feedback Type',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: FeedbackType.values.map((type) {
                final isSelected = _selectedType == type;
                return FilterChip(
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedType = type;
                    });
                  },
                  avatar: Icon(
                    type.icon,
                    size: 18,
                    color: isSelected ? Colors.white : Colors.grey[600],
                  ),
                  label: Text(type.title),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Email Field
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Your Email (Optional)',
                hintText: 'For follow-up responses',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email_outlined),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),

            // Message Field
            Flexible(
              child: TextField(
                controller: _messageController,
                decoration: InputDecoration(
                  labelText: 'Message',
                  hintText: 'Please describe ${_selectedType.description.toLowerCase()}',
                  border: const OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 6,
                minLines: 4,
              ),
            ),
            const SizedBox(height: 24),

            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isSending ? null : () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _isSending || _messageController.text.trim().isEmpty
                      ? null
                      : _sendFeedback,
                  icon: _isSending
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send, size: 18),
                  label: Text(_isSending ? 'Sending...' : 'Send Feedback'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendFeedback() async {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _isSending = true;
    });

    try {
      final success = await FeedbackService.sendFeedback(
        feedbackType: _selectedType,
        message: _messageController.text.trim(),
        userEmail: _emailController.text.trim().isEmpty
            ? null
            : _emailController.text.trim(),
        additionalContext: widget.additionalContext,
        userInfo: widget.userInfo,
      );

      if (mounted) {
        Navigator.pop(context);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success
                ? 'Thank you for your feedback! We have received your message.'
                : 'Failed to send feedback. Please check your connection and try again.'),
            backgroundColor: success ? Colors.green : Colors.red,
            duration: Duration(seconds: success ? 3 : 5),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to send feedback. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }
}
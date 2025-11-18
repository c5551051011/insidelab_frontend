// presentation/widgets/floating_feedback_button.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../services/feedback_service.dart';
import '../../data/providers/data_providers.dart';

class FloatingFeedbackButton extends StatelessWidget {
  final String? additionalContext;
  final FeedbackType? initialFeedbackType;
  final double? bottomOffset;

  const FloatingFeedbackButton({
    Key? key,
    this.additionalContext,
    this.initialFeedbackType,
    this.bottomOffset,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 16,
      bottom: bottomOffset ?? 16,
      child: FloatingActionButton.extended(
        onPressed: () => _showFeedbackDialog(context),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.feedback, size: 20),
        label: const Text(
          'Feedback',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        elevation: 4,
        heroTag: 'feedback_button', // Unique tag to avoid conflicts
      ),
    );
  }

  void _showFeedbackDialog(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    Map<String, dynamic>? userInfo;
    if (user != null) {
      userInfo = {
        'userId': user.id,
        'userName': user.name ?? user.displayName,
        'userEmail': user.email,
        'isVerified': user.isVerified,
        'accountType': user.roles.isNotEmpty ? user.roles.first.name : 'user',
        'registrationDate': user.joinedDate.toIso8601String(),
      };
    }

    FeedbackService.showFeedbackDialog(
      context,
      initialType: initialFeedbackType,
      additionalContext: additionalContext,
      userInfo: userInfo,
    );
  }
}

class CompactFeedbackButton extends StatelessWidget {
  final String? additionalContext;
  final FeedbackType? initialFeedbackType;
  final String? customLabel;
  final IconData? customIcon;

  const CompactFeedbackButton({
    Key? key,
    this.additionalContext,
    this.initialFeedbackType,
    this.customLabel,
    this.customIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      onPressed: () => _showFeedbackDialog(context),
      icon: Icon(
        customIcon ?? Icons.report_outlined,
        size: 16,
        color: AppColors.textSecondary,
      ),
      label: Text(
        customLabel ?? 'Report Issue',
        style: TextStyle(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
      ),
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
    );
  }

  void _showFeedbackDialog(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    Map<String, dynamic>? userInfo;
    if (user != null) {
      userInfo = {
        'userId': user.id,
        'userName': user.name ?? user.displayName,
        'userEmail': user.email,
        'isVerified': user.isVerified,
        'accountType': user.roles.isNotEmpty ? user.roles.first.name : 'user',
        'registrationDate': user.joinedDate.toIso8601String(),
      };
    }

    FeedbackService.showFeedbackDialog(
      context,
      initialType: initialFeedbackType,
      additionalContext: additionalContext,
      userInfo: userInfo,
    );
  }
}

class FeedbackIconButton extends StatelessWidget {
  final String? additionalContext;
  final FeedbackType? initialFeedbackType;
  final String? tooltip;

  const FeedbackIconButton({
    Key? key,
    this.additionalContext,
    this.initialFeedbackType,
    this.tooltip,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => _showFeedbackDialog(context),
      icon: const Icon(Icons.feedback_outlined),
      tooltip: tooltip ?? 'Send Feedback',
      color: AppColors.textSecondary,
    );
  }

  void _showFeedbackDialog(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    Map<String, dynamic>? userInfo;
    if (user != null) {
      userInfo = {
        'userId': user.id,
        'userName': user.name ?? user.displayName,
        'userEmail': user.email,
        'isVerified': user.isVerified,
        'accountType': user.roles.isNotEmpty ? user.roles.first.name : 'user',
        'registrationDate': user.joinedDate.toIso8601String(),
      };
    }

    FeedbackService.showFeedbackDialog(
      context,
      initialType: initialFeedbackType,
      additionalContext: additionalContext,
      userInfo: userInfo,
    );
  }
}
// presentation/widgets/common/verification_badge.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/user.dart';

class VerificationBadge extends StatelessWidget {
  final VerificationStatus status;
  final bool isLabMember;
  final String? customText;
  final double size;
  final bool showTooltip;
  final bool showText;

  const VerificationBadge({
    Key? key,
    required this.status,
    this.isLabMember = false,
    this.customText,
    this.size = 16,
    this.showTooltip = true,
    this.showText = true,
  }) : super(key: key);

  factory VerificationBadge.fromUser(
    User user, {
    double size = 16,
    bool showTooltip = true,
    bool showText = true,
  }) {
    return VerificationBadge(
      status: user.verificationStatus,
      isLabMember: user.isLabMember,
      size: size,
      showTooltip: showTooltip,
      showText: showText,
    );
  }

  @override
  Widget build(BuildContext context) {
    final badgeData = _getBadgeData();
    
    Widget badge = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          badgeData['icon'],
          size: size,
          color: badgeData['color'],
        ),
        if (showText && customText != null) ...[
          const SizedBox(width: 4),
          Text(
            customText!,
            style: TextStyle(
              fontSize: size * 0.8,
              fontWeight: FontWeight.w500,
              color: badgeData['color'],
            ),
          ),
        ] else if (showText) ...[
          const SizedBox(width: 4),
          Text(
            badgeData['text'],
            style: TextStyle(
              fontSize: size * 0.8,
              fontWeight: FontWeight.w500,
              color: badgeData['color'],
            ),
          ),
        ],
      ],
    );

    if (showTooltip) {
      return Tooltip(
        message: badgeData['tooltip'],
        child: badge,
      );
    }

    return badge;
  }

  Map<String, dynamic> _getBadgeData() {
    switch (status) {
      case VerificationStatus.verified:
        return {
          'icon': Icons.verified,
          'color': AppColors.success,
          'text': isLabMember ? 'Lab Member' : 'Verified',
          'tooltip': isLabMember 
            ? 'Verified Lab Member - Can provide services'
            : 'Verified User - Identity confirmed',
        };
      case VerificationStatus.pending:
        return {
          'icon': Icons.pending,
          'color': AppColors.warning,
          'text': 'Pending',
          'tooltip': 'Verification pending - Documents under review',
        };
      case VerificationStatus.unverified:
        return {
          'icon': Icons.help_outline,
          'color': AppColors.textSecondary,
          'text': 'Unverified',
          'tooltip': 'Not verified - Limited access to features',
        };
    }
  }
}

class VerificationBadgeChip extends StatelessWidget {
  final VerificationStatus status;
  final bool isLabMember;
  final VoidCallback? onTap;

  const VerificationBadgeChip({
    Key? key,
    required this.status,
    this.isLabMember = false,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final badgeData = _getBadgeData();
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: badgeData['color'].withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: badgeData['color'].withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              badgeData['icon'],
              size: 14,
              color: badgeData['color'],
            ),
            const SizedBox(width: 4),
            Text(
              badgeData['text'],
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: badgeData['color'],
              ),
            ),
            if (onTap != null) ...[
              const SizedBox(width: 4),
              Icon(
                Icons.arrow_forward,
                size: 12,
                color: badgeData['color'],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getBadgeData() {
    switch (status) {
      case VerificationStatus.verified:
        return {
          'icon': Icons.verified,
          'color': AppColors.success,
          'text': isLabMember ? 'Verified Lab Member' : 'Verified User',
        };
      case VerificationStatus.pending:
        return {
          'icon': Icons.pending,
          'color': AppColors.warning,
          'text': 'Verification Pending',
        };
      case VerificationStatus.unverified:
        return {
          'icon': Icons.help_outline,
          'color': AppColors.error,
          'text': 'Get Verified',
        };
    }
  }
}

class VerificationPrompt extends StatelessWidget {
  final User user;
  final VoidCallback? onVerificationTap;

  const VerificationPrompt({
    Key? key,
    required this.user,
    this.onVerificationTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (user.isVerified) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.primaryDark.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.verified_user,
                color: AppColors.primary,
                size: 24,
              ),
              const SizedBox(width: 8),
              Text(
                'Get Verified',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            user.verificationStatus == VerificationStatus.pending
              ? 'Your verification is being reviewed. You\'ll be notified once approved.'
              : 'Verify your lab affiliation to write reviews and offer services to other students.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          if (user.verificationStatus != VerificationStatus.pending)
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: onVerificationTap ??
                      () => Navigator.pushNamed(context, '/verification'),
                  icon: const Icon(Icons.verified_user, size: 16),
                  label: const Text('Start Verification'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                ),
                const SizedBox(width: 12),
                TextButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => _buildVerificationInfoDialog(context),
                    );
                  },
                  child: const Text('Learn More'),
                ),
              ],
            )
          else
            VerificationBadgeChip(
              status: user.verificationStatus,
              isLabMember: user.isLabMember,
            ),
        ],
      ),
    );
  }

  Widget _buildVerificationInfoDialog(BuildContext context) {
    return AlertDialog(
      title: Text(
        'Verification Benefits',
        style: TextStyle(fontWeight: FontWeight.w600),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Get verified to unlock these features:',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),
          ...[
            'Write honest lab and professor reviews',
            'Offer services like mock interviews and CV reviews',
            'Earn money by helping fellow students',
            'Access premium AI tools and features',
            'Join exclusive verified student community',
            'Higher visibility in search results',
          ].map((benefit) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.check, color: AppColors.success, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    benefit,
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
          )),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.info.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.info, color: AppColors.info, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Verification typically takes 1-2 business days.',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.info,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/verification');
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
          child: const Text('Get Verified'),
        ),
      ],
    );
  }
}
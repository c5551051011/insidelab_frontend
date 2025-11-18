// presentation/widgets/enhanced_bookmark_button.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/lab.dart';
import '../../data/providers/saved_labs_provider.dart';
import '../../data/providers/data_providers.dart';
import '../../services/saved_labs_service.dart';

class EnhancedBookmarkButton extends StatelessWidget {
  final String labId;
  final Color? activeColor;
  final Color? inactiveColor;
  final double size;
  final bool showDropdown;

  const EnhancedBookmarkButton({
    Key? key,
    required this.labId,
    this.activeColor,
    this.inactiveColor,
    this.size = 24,
    this.showDropdown = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer2<SavedLabsProvider, AuthProvider>(
      builder: (context, savedLabsProvider, authProvider, child) {
        final isAuthenticated = authProvider.isAuthenticated;
        final labInterest = savedLabsProvider.getLabInterest(labId);
        final isInterested = labInterest != null;

        if (!showDropdown) {
          // Simple bookmark button without dropdown
          return IconButton(
            onPressed: isAuthenticated
                ? () => _handleSimpleToggle(context, savedLabsProvider)
                : null,
            icon: Icon(
              isInterested ? Icons.bookmark : Icons.bookmark_border,
              color: isInterested
                  ? (activeColor ?? AppColors.primary)
                  : (inactiveColor ?? AppColors.textSecondary),
              size: size,
            ),
            tooltip: isAuthenticated
                ? (isInterested ? 'Remove from interests' : 'Add to interests')
                : 'Sign in to save labs',
          );
        }

        // Enhanced dropdown button
        return PopupMenuButton<String>(
          onSelected: (value) => _handleMenuSelection(context, value, savedLabsProvider, labInterest),
          enabled: isAuthenticated,
          icon: Icon(
            isInterested ? _getInterestIcon(labInterest!.interestType) : Icons.bookmark_border,
            color: isInterested
                ? _getInterestColor(labInterest!.interestType)
                : (inactiveColor ?? AppColors.textSecondary),
            size: size,
          ),
          tooltip: isAuthenticated
              ? _getTooltipText(labInterest)
              : 'Sign in to save labs',
          itemBuilder: (context) => [
            if (isInterested) ...[
              PopupMenuItem(
                value: 'current',
                enabled: false,
                child: Row(
                  children: [
                    Icon(
                      _getInterestIcon(labInterest!.interestType),
                      color: _getInterestColor(labInterest.interestType),
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Current: ${_getInterestLabel(labInterest.interestType)}',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
            ],
            ...LabInterestType.values.map((type) {
              final isCurrent = labInterest?.interestType == type;
              return PopupMenuItem(
                value: type.value,
                child: Row(
                  children: [
                    Icon(
                      _getInterestIcon(type),
                      color: isCurrent ? _getInterestColor(type) : AppColors.textSecondary,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getInterestLabel(type),
                      style: TextStyle(
                        color: isCurrent ? _getInterestColor(type) : AppColors.textPrimary,
                        fontWeight: isCurrent ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                    if (isCurrent) ...[
                      const Spacer(),
                      Icon(Icons.check, color: _getInterestColor(type), size: 16),
                    ],
                  ],
                ),
              );
            }).toList(),
            if (isInterested) ...[
              const PopupMenuDivider(),
              PopupMenuItem(
                value: 'remove',
                child: Row(
                  children: [
                    const Icon(Icons.delete_outline, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    const Text(
                      'Remove Interest',
                      style: TextStyle(color: AppColors.error),
                    ),
                  ],
                ),
              ),
            ],
          ],
        );
      },
    );
  }

  Future<void> _handleSimpleToggle(
    BuildContext context,
    SavedLabsProvider savedLabsProvider,
  ) async {
    final success = await savedLabsProvider.toggleLabSave(
      // Create a minimal Lab object for legacy compatibility
      Lab(
        id: labId,
        name: '',
        professorName: '',
        professorId: '',
        universityName: '',
        universityId: '',
        department: '',
        overallRating: 0.0,
        reviewCount: 0,
        researchAreas: [],
        tags: [],
      ),
    );

    if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update interest. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _handleMenuSelection(
    BuildContext context,
    String value,
    SavedLabsProvider savedLabsProvider,
    LabInterest? currentInterest,
  ) async {
    if (value == 'remove') {
      final success = await savedLabsProvider.removeLabInterest(labId);

      if (!success && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to remove interest. Please try again.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    if (value == 'current') return;

    // Handle interest type selection
    final interestType = LabInterestType.fromString(value);
    final bool success;

    if (currentInterest != null) {
      // Update existing interest
      success = await savedLabsProvider.updateInterestType(labId, interestType);
    } else {
      // Add new interest
      success = await savedLabsProvider.addLabInterest(labId, interestType: interestType);
    }

    if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update interest. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  IconData _getInterestIcon(LabInterestType type) {
    switch (type) {
      case LabInterestType.general:
        return Icons.bookmark;
      case LabInterestType.application:
        return Icons.send;
      case LabInterestType.watching:
        return Icons.visibility;
      case LabInterestType.recruited:
        return Icons.how_to_reg;
    }
  }

  Color _getInterestColor(LabInterestType type) {
    switch (type) {
      case LabInterestType.general:
        return AppColors.primary;
      case LabInterestType.application:
        return AppColors.warning;
      case LabInterestType.watching:
        return AppColors.info;
      case LabInterestType.recruited:
        return AppColors.success;
    }
  }

  String _getInterestLabel(LabInterestType type) {
    switch (type) {
      case LabInterestType.general:
        return 'General Interest';
      case LabInterestType.application:
        return 'Want to Apply';
      case LabInterestType.watching:
        return 'Watching';
      case LabInterestType.recruited:
        return 'Recruited';
    }
  }

  String _getTooltipText(LabInterest? interest) {
    if (interest == null) {
      return 'Add to interests';
    }
    return '${_getInterestLabel(interest.interestType)} - Click to change';
  }
}

// Extension for creating a minimal Lab from the existing Lab model for legacy compatibility
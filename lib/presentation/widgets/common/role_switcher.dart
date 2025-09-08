// presentation/widgets/common/role_switcher.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/user.dart';
import '../../../data/providers/data_providers.dart';
import '../../../services/role_service.dart';

class RoleSwitcher extends StatelessWidget {
  final bool showFullWidth;
  final bool showIcon;

  const RoleSwitcher({
    Key? key,
    this.showFullWidth = false,
    this.showIcon = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;
        if (user == null || !user.isVerified) return const SizedBox.shrink();

        return Container(
          width: showFullWidth ? double.infinity : null,
          child: _buildRoleToggle(context, user, authProvider),
        );
      },
    );
  }

  Widget _buildRoleToggle(BuildContext context, User user, AuthProvider authProvider) {
    final currentRole = user.roles.last; // Use the most recent role
    final canProvide = user.canProvideServices;
    
    if (!canProvide) return const SizedBox.shrink();

    return IntrinsicWidth(
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(24),
          color: AppColors.surface,
        ),
        child: Row(
          mainAxisSize: showFullWidth ? MainAxisSize.max : MainAxisSize.min,
          children: [
            _buildRoleButton(
              context: context,
              role: UserRole.seeker,
              isActive: currentRole == UserRole.seeker,
              user: user,
              authProvider: authProvider,
            ),
            _buildRoleButton(
              context: context,
              role: UserRole.provider,
              isActive: currentRole == UserRole.provider,
              user: user,
              authProvider: authProvider,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleButton({
    required BuildContext context,
    required UserRole role,
    required bool isActive,
    required User user,
    required AuthProvider authProvider,
  }) {
    final roleInfo = RoleService().getRoleFeatures(role);
    
    return Flexible(
      flex: 1,
      child: InkWell(
        onTap: isActive ? null : () => _switchRole(context, role, user, authProvider),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(
            horizontal: showFullWidth ? 16 : 12,
            vertical: 8,
          ),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (showIcon) ...[
                Icon(
                  _getRoleIcon(role),
                  size: 16,
                  color: isActive ? Colors.white : AppColors.textSecondary,
                ),
                const SizedBox(width: 6),
              ],
              Flexible(
                child: Text(
                  roleInfo['name'],
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                    color: isActive ? Colors.white : AppColors.textSecondary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getRoleIcon(UserRole role) {
    switch (role) {
      case UserRole.seeker:
        return Icons.school;
      case UserRole.provider:
        return Icons.work;
      case UserRole.admin:
        return Icons.admin_panel_settings;
    }
  }

  void _switchRole(BuildContext context, UserRole targetRole, User user, AuthProvider authProvider) async {
    try {
      // Show loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      // Switch role
      final updatedUser = await RoleService().switchRole(user, targetRole);
      
      // Update auth provider (in a real app, this would be handled by the service)
      // For now, we'll just simulate the role switch
      
      Navigator.pop(context); // Close loading dialog

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Switched to ${RoleService().getRoleFeatures(targetRole)['name']} mode'
          ),
          backgroundColor: AppColors.success,
        ),
      );

      // Navigate to appropriate screen if needed
      if (targetRole == UserRole.provider) {
        // Check if needs onboarding
        if (RoleService().needsProviderOnboarding(updatedUser)) {
          Navigator.pushNamed(context, '/provider-onboarding');
        } else {
          Navigator.pushNamed(context, '/provider-dashboard');
        }
      }

    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error switching role: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}

class RoleSwitcherCard extends StatelessWidget {
  const RoleSwitcherCard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;
        if (user == null || !user.isVerified) return const SizedBox.shrink();

        return Card(
          margin: const EdgeInsets.all(16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.swap_horiz, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Text(
                      'Switch Mode',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Toggle between browsing services as a student or providing services to earn money.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                RoleSwitcher(showFullWidth: true),
                const SizedBox(height: 16),
                _buildCurrentRoleInfo(user),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCurrentRoleInfo(User user) {
    final currentRole = user.roles.last;
    final roleInfo = RoleService().getRoleFeatures(currentRole);
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Current Mode: ${roleInfo['name']}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            roleInfo['description'],
            style: TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
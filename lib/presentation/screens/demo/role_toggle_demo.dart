// presentation/screens/demo/role_toggle_demo.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/common/role_switcher.dart';
import '../../widgets/common/verification_badge.dart';

class RoleToggleDemoScreen extends StatelessWidget {
  const RoleToggleDemoScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDemoHeader(),
                const SizedBox(height: 32),
                _buildToggleLocations(),
                const SizedBox(height: 32),
                _buildInstructions(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDemoHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '🔄 Role Toggle Demo',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'This demo shows all the places where users can toggle between Student and Service Provider modes on the website.',
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildToggleLocations() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Toggle Locations',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 20),
        
        // Location 1: Header Navigation
        _buildToggleCard(
          '1. Header Navigation Bar',
          'Look at the top navigation - you\'ll see the role toggle next to the menu items',
          Icons.navigation,
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              final user = authProvider.currentUser;
              if (user?.canProvideServices == true) {
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: RoleSwitcher(),
                );
              }
              return Text(
                'Please get verified first to see the toggle',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontStyle: FontStyle.italic,
                ),
              );
            },
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Location 2: Profile Dropdown
        _buildToggleCard(
          '2. Profile Dropdown Menu',
          'Click your profile picture in the header to see role-specific menu options',
          Icons.account_circle,
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              final user = authProvider.currentUser;
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (user?.canProvideServices == true)
                      Text('✅ "Become Service Provider" option available', 
                           style: TextStyle(color: AppColors.success))
                    else
                      Text('❌ Get verified first to see provider options', 
                           style: TextStyle(color: AppColors.error)),
                    const SizedBox(height: 8),
                    if (user?.isVerified == true)
                      VerificationBadge.fromUser(user!, size: 14)
                    else
                      Text('Need verification badge', 
                           style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  ],
                ),
              );
            },
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Location 3: Role Switcher Card
        _buildToggleCard(
          '3. Role Switcher Card',
          'A dedicated card component for profile pages and dashboards',
          Icons.credit_card,
          RoleSwitcherCard(),
        ),
      ],
    );
  }

  Widget _buildToggleCard(String title, String description, IconData icon, Widget demo) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            demo,
          ],
        ),
      ),
    );
  }

  Widget _buildInstructions() {
    return Card(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.info.withOpacity(0.1),
              AppColors.info.withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info, color: AppColors.info),
                const SizedBox(width: 8),
                Text(
                  'How to Use Role Toggle',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.info,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...[
              '1. **Get Verified First**: Complete lab verification to unlock provider mode',
              '2. **Look for Toggle**: Find the Student/Provider toggle in header navigation',
              '3. **Click to Switch**: Click the inactive mode to switch roles',
              '4. **Confirm Switch**: Confirm your choice in the dialog that appears',
              '5. **Enjoy New Mode**: You\'ll be redirected to the appropriate dashboard',
            ].map((instruction) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                instruction,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textPrimary,
                  height: 1.4,
                ),
              ),
            )),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.success.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.lightbulb, color: AppColors.success, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Pro Tip: You can switch modes anytime to access different features!',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.success,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
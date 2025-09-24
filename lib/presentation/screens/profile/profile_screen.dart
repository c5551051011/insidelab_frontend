import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          
          if (user == null) {
            return const Center(
              child: Text('Please sign in to view your profile'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProfileHeader(user),
                const SizedBox(height: 32),
                _buildProfileStats(user),
                const SizedBox(height: 32),
                _buildAccountInfo(user),
                const SizedBox(height: 32),
                _buildActions(context),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(user) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: Colors.white,
            child: Text(
              user.email.substring(0, 1).toUpperCase(),
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      user.isVerified ? Icons.verified : Icons.pending,
                      color: Colors.white70,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      user.isVerified ? 'Verified Student' : 'Pending Verification',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Member since ${_formatDate(user.joinedDate)}',
                  style: const TextStyle(
                    color: Colors.white60,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileStats(user) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Reviews Written',
            user.reviewCount.toString(),
            Icons.rate_review,
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Helpful Votes',
            user.helpfulVotes.toString(),
            Icons.thumb_up,
            AppColors.success,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAccountInfo(user) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Account Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Email', user.email),
            const SizedBox(height: 12),
            _buildInfoRow('Username', user.name),
            const SizedBox(height: 12),
            _buildInfoRow('Status', user.isVerified ? 'Verified' : 'Pending Verification'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ElevatedButton.icon(
          onPressed: () {
            context.go('/profile/my-reviews');
          },
          icon: const Icon(Icons.rate_review),
          label: const Text('View My Reviews'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            backgroundColor: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            _showEditProfileDialog(context);
          },
          icon: const Icon(Icons.edit),
          label: const Text('Edit Profile'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.all(16),
          ),
        ),
        const SizedBox(height: 12),
        TextButton.icon(
          onPressed: () {
            _showSignOutDialog(context);
          },
          icon: const Icon(Icons.logout, color: AppColors.error),
          label: const Text(
            'Sign Out',
            style: TextStyle(color: AppColors.error),
          ),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: const Text('Profile editing functionality coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSignOutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              final authProvider = context.read<AuthProvider>();
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.pushNamedAndRemoveUntil(context, '/', (route) => false);
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
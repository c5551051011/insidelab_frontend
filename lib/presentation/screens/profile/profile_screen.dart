import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/saved_lab.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/lab_interests_widget.dart';
import '../../widgets/floating_feedback_button.dart';
import '../../../services/university_email_verification_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Stack(
        children: [
          Consumer<AuthProvider>(
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
                    _buildAcademicProfile(user),
                    const SizedBox(height: 32),
                    _buildResearchInterests(context, user),
                    const SizedBox(height: 32),
                    const LabInterestsWidget(),
                    const SizedBox(height: 32),
                    _buildAccountInfo(user),
                    const SizedBox(height: 32),
                    _buildVerificationStatus(context, user),
                    const SizedBox(height: 32),
                    _buildActions(context),
                  ],
                ),
              );
            },
          ),
          const FloatingFeedbackButton(),
        ],
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

  Widget _buildAcademicProfile(user) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.school, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Academic Profile',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (user.university != null) ...[
              _buildInfoRow('University', user.university!),
              const SizedBox(height: 12),
            ],
            if (user.department != null) ...[
              _buildInfoRow('Department', user.department!),
              const SizedBox(height: 12),
            ],
            if (user.position != null) ...[
              _buildInfoRow('Position', user.position!),
              const SizedBox(height: 12),
            ],
            if (user.labName != null) ...[
              _buildInfoRow('Lab', user.labName!),
              const SizedBox(height: 12),
            ],
            if (user.advisorName != null) ...[
              _buildInfoRow('Advisor', user.advisorName!),
              const SizedBox(height: 12),
            ],
            if (user.bio != null) ...[
              const SizedBox(height: 8),
              Text(
                'Bio',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                user.bio!,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildResearchInterests(BuildContext context, user) {
    final hasResearchData = user.researchArea != null ||
                           user.specialties.isNotEmpty ||
                           user.publications.isNotEmpty;

    if (!hasResearchData) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.science, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Research Interests',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () => _showEditResearchInterestsDialog(context, user),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.add, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Add your research interests to help others find you',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Icon(Icons.arrow_forward_ios, color: AppColors.primary, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.science, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Text(
                      'Research Interests',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => _showEditResearchInterestsDialog(context, user),
                  icon: const Icon(Icons.edit, size: 20),
                  tooltip: 'Edit Research Interests',
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (user.researchArea != null) ...[
              Text(
                'Primary Research Area',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  user.researchArea!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            if (user.specialties.isNotEmpty) ...[
              Text(
                'Specialties & Interests',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: user.specialties.map((specialty) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  ),
                  child: Text(
                    specialty,
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                )).toList(),
              ),
              const SizedBox(height: 16),
            ],
            if (user.publications.isNotEmpty) ...[
              Text(
                'Publications (${user.publications.length})',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              ...user.publications.take(3).map((publication) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6),
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.textSecondary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        publication,
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              )).toList(),
              if (user.publications.length > 3)
                Builder(
                  builder: (context) => TextButton(
                    onPressed: () {
                      _showAllPublications(context, user.publications);
                    },
                    child: Text('View all ${user.publications.length} publications'),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }



  void _showEditResearchInterestsDialog(BuildContext context, user) {
    final researchAreaController = TextEditingController(text: user.researchArea ?? '');
    final specialtiesController = TextEditingController(text: user.specialties.join(', '));
    final bioController = TextEditingController(text: user.bio ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Research Interests'),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Primary Research Area',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: researchAreaController,
                  decoration: InputDecoration(
                    hintText: 'e.g., Machine Learning, Bioengineering...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Specialties & Interests',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Separate multiple items with commas',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: specialtiesController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'e.g., Deep Learning, Computer Vision, NLP...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Research Bio',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: bioController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Tell others about your research interests and goals...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _updateResearchInterests(
                context,
                researchAreaController.text.trim(),
                specialtiesController.text.trim(),
                bioController.text.trim(),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
            ),
            child: const Text('Save Changes', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _updateResearchInterests(
    BuildContext context,
    String researchArea,
    String specialtiesText,
    String bio,
  ) async {
    try {
      // Parse specialties from comma-separated string
      final specialties = specialtiesText
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();

      // TODO: Implement API call to update user research interests
      // This would typically call something like:
      // await UserService.updateResearchInterests(
      //   researchArea: researchArea.isEmpty ? null : researchArea,
      //   specialties: specialties,
      //   bio: bio.isEmpty ? null : bio,
      // );

      // Show success message
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Research interests updated successfully'),
            backgroundColor: AppColors.success,
          ),
        );

        // TODO: Refresh user data or update provider state
        // This would typically trigger a reload of the user data
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update research interests: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
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

  Widget _buildVerificationStatus(BuildContext context, user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: user.isVerified
            ? AppColors.success.withOpacity(0.1)
            : AppColors.warning.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: user.isVerified
              ? AppColors.success.withOpacity(0.3)
              : AppColors.warning.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                user.isVerified ? Icons.verified : Icons.verified_user_outlined,
                color: user.isVerified ? AppColors.success : AppColors.warning,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                user.isVerified ? 'Verified Account' : 'Account Verification',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (user.isVerified) ...[
            Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.success, size: 16),
                const SizedBox(width: 8),
                Text(
                  'University email verified',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.security, color: AppColors.success, size: 16),
                const SizedBox(width: 8),
                Text(
                  'Enhanced trust and credibility',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ] else ...[
            Text(
              'Verify your university email to increase trust and access exclusive features.',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pushNamed(context, '/get-verified');
                    },
                    icon: const Icon(Icons.verified_user, size: 18),
                    label: const Text('Get Verified'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () {
                    _showVerificationBenefitsDialog(context);
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    side: BorderSide(color: AppColors.primary),
                  ),
                  child: Text(
                    'Learn More',
                    style: TextStyle(color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ElevatedButton.icon(
          onPressed: () {
            Navigator.pushNamed(context, '/my-reviews');
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

  void _showAllPublications(BuildContext context, List<String> publications) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Publications (${publications.length})'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: publications.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                publications[index],
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => EditProfileDialog(),
    );
  }

  void _showVerificationBenefitsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.verified_user, color: AppColors.primary, size: 24),
            const SizedBox(width: 8),
            const Text('Verification Benefits'),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Get verified to unlock these benefits:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              ...[
                'Verified badge on your profile',
                'Higher trust from other users',
                'Access to university-specific content',
                'Priority support and features',
                'Connect with verified users from your university',
                'Enhanced credibility for reviews and recommendations',
              ].map((benefit) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: AppColors.success, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        benefit,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/get-verified');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Get Verified'),
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

class EditProfileDialog extends StatefulWidget {
  @override
  _EditProfileDialogState createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends State<EditProfileDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _universityController = TextEditingController();
  final _departmentController = TextEditingController();
  final _positionController = TextEditingController();
  final _labNameController = TextEditingController();
  final _advisorNameController = TextEditingController();
  final _bioController = TextEditingController();
  final _researchAreaController = TextEditingController();

  List<String> _specialties = [];
  List<String> _publications = [];
  final _specialtyController = TextEditingController();
  final _publicationController = TextEditingController();

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeFields();
  }

  void _initializeFields() {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.currentUser;

    if (user != null) {
      _nameController.text = user.displayName;
      _universityController.text = user.university ?? '';
      _departmentController.text = user.department ?? '';
      _positionController.text = user.position ?? '';
      _labNameController.text = user.labName ?? '';
      _advisorNameController.text = user.advisorName ?? '';
      _bioController.text = user.bio ?? '';
      _researchAreaController.text = user.researchArea ?? '';
      _specialties = List.from(user.specialties);
      _publications = List.from(user.publications);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 600,
          maxHeight: MediaQuery.of(context).size.height * 0.9,
        ),
        child: Container(
          width: MediaQuery.of(context).size.width * 0.9,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Edit Profile',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSection(
                        'Personal Information',
                        Icons.person,
                        [
                          _buildTextField(
                            controller: _nameController,
                            label: 'Full Name',
                            validator: (value) {
                              if (value?.isEmpty ?? true) {
                                return 'Name is required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _bioController,
                            label: 'Bio / Research Statement',
                            maxLines: 3,
                            hint: 'Tell others about your research interests and goals...',
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildSection(
                        'Academic Information',
                        Icons.school,
                        [
                          _buildTextField(
                            controller: _universityController,
                            label: 'University',
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _departmentController,
                            label: 'Department',
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _positionController,
                            label: 'Position',
                            hint: 'e.g., PhD Student, Masters Student, Postdoc',
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _labNameController,
                            label: 'Lab Name',
                          ),
                          const SizedBox(height: 16),
                          _buildTextField(
                            controller: _advisorNameController,
                            label: 'Advisor Name',
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildSection(
                        'Research Information',
                        Icons.science,
                        [
                          _buildTextField(
                            controller: _researchAreaController,
                            label: 'Primary Research Area',
                            hint: 'e.g., Machine Learning, Computer Vision, NLP',
                          ),
                          const SizedBox(height: 16),
                          _buildSpecialtiesSection(),
                          const SizedBox(height: 16),
                          _buildPublicationsSection(),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isLoading ? null : () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: _isLoading
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Save Changes'),
                ),
              ],
            ),
          ],
        ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildSpecialtiesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _specialtyController,
                decoration: InputDecoration(
                  labelText: 'Add Specialty/Interest',
                  hintText: 'e.g., Deep Learning, Computer Vision',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.primary),
                  ),
                ),
                onFieldSubmitted: _addSpecialty,
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => _addSpecialty(_specialtyController.text),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Add'),
            ),
          ],
        ),
        if (_specialties.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _specialties.map((specialty) => Chip(
              label: Text(specialty),
              deleteIcon: Icon(Icons.close, size: 16),
              onDeleted: () => _removeSpecialty(specialty),
              backgroundColor: AppColors.primary.withOpacity(0.1),
              deleteIconColor: AppColors.primary,
            )).toList(),
          ),
        ],
      ],
    );
  }

  Widget _buildPublicationsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _publicationController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Add Publication',
                  hintText: 'Enter publication title and authors...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => _addPublication(_publicationController.text),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Add'),
            ),
          ],
        ),
        if (_publications.isNotEmpty) ...[
          const SizedBox(height: 12),
          ..._publications.asMap().entries.map((entry) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      entry.value,
                      style: TextStyle(fontSize: 14),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.delete, color: AppColors.error, size: 18),
                    onPressed: () => _removePublication(entry.key),
                  ),
                ],
              ),
            ),
          )).toList(),
        ],
      ],
    );
  }

  void _addSpecialty(String specialty) {
    if (specialty.trim().isNotEmpty && !_specialties.contains(specialty.trim())) {
      setState(() {
        _specialties.add(specialty.trim());
        _specialtyController.clear();
      });
    }
  }

  void _removeSpecialty(String specialty) {
    setState(() {
      _specialties.remove(specialty);
    });
  }

  void _addPublication(String publication) {
    if (publication.trim().isNotEmpty) {
      setState(() {
        _publications.add(publication.trim());
        _publicationController.clear();
      });
    }
  }

  void _removePublication(int index) {
    setState(() {
      _publications.removeAt(index);
    });
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = context.read<AuthProvider>();

      // TODO: Implement actual API call to update user profile
      // For now, we'll show a success message

      await Future.delayed(const Duration(seconds: 1)); // Simulate API call

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Profile updated successfully!'),
            backgroundColor: AppColors.success,
          ),
        );

        // TODO: Refresh user data or update provider
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _universityController.dispose();
    _departmentController.dispose();
    _positionController.dispose();
    _labNameController.dispose();
    _advisorNameController.dispose();
    _bioController.dispose();
    _researchAreaController.dispose();
    _specialtyController.dispose();
    _publicationController.dispose();
    super.dispose();
  }
}
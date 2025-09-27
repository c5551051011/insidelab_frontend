
// presentation/screens/auth/sign_up_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:math';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/university.dart';
import '../../../data/models/university_department.dart';
import '../../../services/university_service.dart';
import '../../../services/university_department_service.dart';
import '../../../utils/validators.dart';
import '../../../utils/helpers.dart';
import '../../widgets/common/header_navigation.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({Key? key}) : super(key: key);

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _selectedPosition;
  String? _selectedUniversityId;
  String? _selectedUniversityName;
  String? _selectedUniversityDepartmentId;
  final _nameController = TextEditingController();
  final _universityController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreedToTerms = false;
  bool _allowEmails = false;

  // University and Department data
  List<University> _universities = [];
  List<UniversityDepartment> _universityDepartments = [];
  bool _isLoadingDepartments = false;
  bool _isLoadingUniversities = false;

  @override
  void initState() {
    super.initState();
    _generateRandomUsername();
    _loadUniversities();
  }

  void _generateRandomUsername() {
    final random = Random();

    // Adjectives for friendly usernames
    final adjectives = [
      'Smart', 'Bright', 'Quick', 'Swift', 'Sharp', 'Wise', 'Bold', 'Cool',
      'Fast', 'Strong', 'Clear', 'Fresh', 'Young', 'New', 'Pure', 'True',
      'Deep', 'High', 'Wild', 'Free', 'Safe', 'Easy', 'Fine', 'Good',
      'Kind', 'Nice', 'Calm', 'Fair', 'Real', 'Rich', 'Soft', 'Warm'
    ];

    // Nouns related to academia/research
    final nouns = [
      'Scholar', 'Student', 'Learner', 'Thinker', 'Reader', 'Writer', 'Seeker',
      'Explorer', 'Finder', 'Builder', 'Maker', 'Creator', 'Helper', 'Leader',
      'Dreamer', 'Planner', 'Doer', 'Walker', 'Runner', 'Climber', 'Flyer',
      'Star', 'Moon', 'Sun', 'River', 'Ocean', 'Mountain', 'Forest', 'Garden',
      'Bridge', 'Tower', 'Castle', 'House', 'Path', 'Journey', 'Quest', 'Goal'
    ];

    final adjective = adjectives[random.nextInt(adjectives.length)];
    final noun = nouns[random.nextInt(nouns.length)];
    final number = random.nextInt(999) + 1; // 1-999

    final username = '$adjective$noun$number';
    _usernameController.text = username;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 32),
                _buildVerificationNotice(),
                const SizedBox(height: 32),
                _buildForm(),
                const SizedBox(height: 24),
                _buildTermsAndConditions(),
                const SizedBox(height: 24),
                _buildSignUpButton(),
                const SizedBox(height: 16),
                _buildDivider(),
                const SizedBox(height: 16),
                _buildGoogleSignUpButton(),
                const SizedBox(height: 16),
                _buildSignInLink(),
                const SizedBox(height: 32),
                _buildPrivacyNote(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const Text(
          'InsideLab',
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Join the community',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Share your lab experiences anonymously',
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildVerificationNotice() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.info.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.info.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.verified_user, color: AppColors.info),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Verification Notice',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.info,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Use any valid email address to create your account',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.info.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email Address',
              hintText: 'your.email@example.com',
              prefixIcon: Icon(Icons.email),
              helperText: 'Must be a valid email address',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!Validators.isValidEmail(value)) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          _buildUsernameField(),
          const SizedBox(height: 20),
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Full Name',
              hintText: 'Enter your full name',
              prefixIcon: Icon(Icons.person_outline),
              helperText: 'Your real name (will not be shown publicly)',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your name';
              }
              return null;
            },
          ),
          const SizedBox(height: 20),
          Container(
            constraints: const BoxConstraints(
              minHeight: 56,
              maxHeight: 120,
            ),
            child: DropdownButtonFormField<String>(
              value: _selectedPosition,
              decoration: const InputDecoration(
                labelText: 'Current Position',
                prefixIcon: Icon(Icons.work),
                helperText: 'Helps contextualize your reviews',
              ),
              isExpanded: true,
              menuMaxHeight: 300,
              items: AppConstants.positions
                  .map((position) => DropdownMenuItem(
                value: position,
                child: Container(
                  constraints: const BoxConstraints(minHeight: 48),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      position,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedPosition = value;
                });
              },
              validator: (value) {
                if (value == null) {
                  return 'Please select your position';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          _buildUniversitySelection(),
          const SizedBox(height: 20),
          _buildDepartmentSelection(),
          const SizedBox(height: 20),
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock),
              helperText: 'At least 8 characters with mixed case and numbers',
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              ),
            ),
            validator: Validators.validatePassword,
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: _obscureConfirmPassword,
            decoration: InputDecoration(
              labelText: 'Confirm Password',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility
                      : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _obscureConfirmPassword = !_obscureConfirmPassword;
                  });
                },
              ),
            ),
            validator: (value) {
              if (value != _passwordController.text) {
                return 'Passwords do not match';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildUsernameField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username (Anonymous)',
                  hintText: 'Auto-generated for privacy',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please choose a username';
                  }
                  if (value.length < 3) {
                    return 'Username must be at least 3 characters';
                  }
                  if (value.length > 20) {
                    return 'Username must be less than 20 characters';
                  }
                  return null;
                },
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: _generateRandomUsername,
              icon: const Icon(Icons.refresh),
              tooltip: 'Generate new username',
              style: IconButton.styleFrom(
                backgroundColor: AppColors.primary.withOpacity(0.1),
                foregroundColor: AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
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
                Icons.privacy_tip_outlined,
                color: AppColors.info,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Privacy Recommendation',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppColors.info,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'We recommend using the auto-generated username to protect your privacy. You can change it, but random usernames help keep your reviews anonymous.',
                      style: TextStyle(
                        color: AppColors.info,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTermsAndConditions() {
    return Column(
      children: [
        CheckboxListTile(
          value: _agreedToTerms,
          onChanged: (value) {
            setState(() {
              _agreedToTerms = value ?? false;
            });
          },
          title: const Text(
            'I agree to the Terms of Service and Privacy Policy',
            style: TextStyle(fontSize: 14),
          ),
          subtitle: const Text(
            'I understand my reviews will be anonymous but public',
            style: TextStyle(fontSize: 12),
          ),
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
        ),
        CheckboxListTile(
          value: _allowEmails,
          onChanged: (value) {
            setState(() {
              _allowEmails = value ?? false;
            });
          },
          title: const Text(
            'Send me helpful emails about new features (optional)',
            style: TextStyle(fontSize: 14),
          ),
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
        ),
      ],
    );
  }

  Widget _buildSignUpButton() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        return SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: (!_agreedToTerms ||
                       authProvider.isLoading ||
                       _selectedPosition == null ||
                       _selectedUniversityDepartmentId == null)
                ? null
                : _signUp,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              disabledBackgroundColor: AppColors.textTertiary,
            ),
            child: authProvider.isLoading
                ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            )
                : const Text(
              'Create Account',
              style: TextStyle(fontSize: 16),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSignInLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text('Already have an account?'),
        TextButton(
          onPressed: () {
            context.go('/sign-in');
          },
          child: const Text('Sign In'),
        ),
      ],
    );
  }

  Widget _buildPrivacyNote() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.lock, size: 16, color: AppColors.success),
              const SizedBox(width: 8),
              Text(
                'Your Privacy Matters',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '• Your real name is never shown\n'
                '• Reviews are posted under your username only\n'
                '• Email is only used for verification',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _signUp() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = context.read<AuthProvider>();

      // Debug validation
      print('DEBUG: Signup validation data:');
      print('  Email: ${_emailController.text.trim()}');
      print('  Username: ${_usernameController.text.trim()}');
      print('  Name: ${_nameController.text.trim()}');
      print('  Position: $_selectedPosition');
      print('  University ID: $_selectedUniversityId');
      print('  University Name: $_selectedUniversityName');
      print('  University Department ID: $_selectedUniversityDepartmentId');

      // Additional validation
      if (_selectedPosition == null) {
        Helpers.showSnackBar(context, 'Please select your position', isError: true);
        return;
      }
      if (_selectedUniversityDepartmentId == null) {
        Helpers.showSnackBar(context, 'Please select your university and department', isError: true);
        return;
      }

      try {
        await authProvider.signUp({
          'email': _emailController.text.trim(),
          'username': _usernameController.text.trim(),
          'name': _nameController.text.trim(),
          'password': _passwordController.text,
          'password_confirm': _confirmPasswordController.text,
          'position': _selectedPosition!,
          'university_department': _selectedUniversityDepartmentId!,
        });

        if (mounted) {
          // Navigate to email verification screen
          context.go('/email-verification?email=${Uri.encodeComponent(_emailController.text.trim())}&userId=${authProvider.currentUser?.id}');
        }
      } catch (e) {
        if (mounted) {
          final errorMessage = authProvider.errorMessage ??
                              'Sign up failed. Please check your connection and try again.';
          Helpers.showSnackBar(
            context,
            errorMessage,
            isError: true,
          );
          authProvider.clearError();
        }
      }
    }
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(child: Divider(color: AppColors.textTertiary)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'OR',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(child: Divider(color: AppColors.textTertiary)),
      ],
    );
  }

  Widget _buildGoogleSignUpButton() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        return SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: authProvider.isLoading ? null : _signUpWithGoogle,
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: AppColors.textTertiary),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: authProvider.isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.textSecondary,
                    ),
                  )
                : Image.asset(
                    'assets/icons/google_logo.png', // You'll need to add this asset
                    height: 20,
                    width: 20,
                    errorBuilder: (context, error, stackTrace) => Icon(
                      Icons.account_circle,
                      size: 20,
                      color: AppColors.textSecondary,
                    ),
                  ),
            label: Text(
              'Continue with Google',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _signUpWithGoogle() async {
    if (!_agreedToTerms) {
      Helpers.showSnackBar(
        context,
        'Please agree to the Terms of Service and Privacy Policy',
        isError: true,
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    
    try {
      await authProvider.signInWithGoogle();
      
      if (mounted) {
        if (authProvider.isAuthenticated) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              icon: const Icon(
                Icons.check_circle,
                size: 48,
                color: AppColors.success,
              ),
              title: const Text('Welcome to InsideLab!'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Your Google account has been linked successfully.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.check_circle, color: AppColors.success),
                        const SizedBox(height: 8),
                        const Text(
                          'Your account is ready to use!',
                          style: TextStyle(fontSize: 14),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    context.go('/');
                  },
                  child: const Text('Get Started'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(
          context,
          authProvider.errorMessage ?? 'Google Sign-Up failed. Please try again.',
          isError: true,
        );
        authProvider.clearError();
      }
    }
  }

  Future<void> _loadUniversities() async {
    try {
      final universities = await UniversityService.searchUniversities('');
      if (mounted) {
        setState(() {
          _universities = universities;
        });
      }
    } catch (e) {
      print('Error loading universities: $e');
    }
  }

  Future<void> _loadDepartmentsForUniversity(String universityId) async {
    setState(() {
      _isLoadingDepartments = true;
      _universityDepartments.clear();
      _selectedUniversityDepartmentId = null;
    });

    try {
      final departments = await UniversityDepartmentService.getDepartmentsByUniversity(universityId);
      if (mounted) {
        setState(() {
          _universityDepartments = departments;
          _isLoadingDepartments = false;
        });
      }
    } catch (e) {
      print('Error loading departments: $e');
      if (mounted) {
        setState(() {
          _isLoadingDepartments = false;
        });
      }
    }
  }

  Widget _buildUniversitySelection() {
    return Container(
      constraints: const BoxConstraints(
        minHeight: 56,
        maxHeight: 120,
      ),
      child: DropdownButtonFormField<String>(
        value: _selectedUniversityId,
        decoration: InputDecoration(
          labelText: 'University *',
          prefixIcon: const Icon(Icons.school),
          helperText: 'Select your university or add new',
          suffixIcon: _isLoadingUniversities
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : null,
        ),
        isExpanded: true,
        menuMaxHeight: 300,
        items: [
          ..._universities.map((university) {
            return DropdownMenuItem<String>(
              value: university.id,
              child: Container(
                constraints: const BoxConstraints(minHeight: 48),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${university.name} - ${university.city}',
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              ),
            );
          }),
          DropdownMenuItem<String>(
            value: '___ADD_NEW_UNIVERSITY___',
            child: Container(
              constraints: const BoxConstraints(minHeight: 48),
              child: Row(
                children: [
                  Icon(Icons.add, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Add New University',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        onChanged: (String? universityId) {
          if (universityId == '___ADD_NEW_UNIVERSITY___') {
            _showAddUniversityDialog();
          } else if (universityId != null) {
            final university = _universities.firstWhere((u) => u.id == universityId);
            setState(() {
              _selectedUniversityId = universityId;
              _selectedUniversityName = university.name;
              _universityController.text = university.name;
            });
            _loadDepartmentsForUniversity(universityId);
          }
        },
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please select your university';
          }
          return null;
        },
      ),
    );
  }

  Widget _buildDepartmentSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          constraints: const BoxConstraints(
            minHeight: 56,
            maxHeight: 120,
          ),
          child: DropdownButtonFormField<String>(
            value: _selectedUniversityDepartmentId,
            decoration: InputDecoration(
              labelText: 'Department *',
              prefixIcon: const Icon(Icons.science),
              helperText: _selectedUniversityId != null
                  ? 'Select your department or add new'
                  : 'Select a university first',
              suffixIcon: _isLoadingDepartments
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : null,
            ),
            isExpanded: true,
            menuMaxHeight: 300,
            items: [
              ..._universityDepartments.map((dept) => DropdownMenuItem<String>(
                value: dept.id,
                child: Container(
                  constraints: const BoxConstraints(minHeight: 48),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      dept.displayName,
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ),
              )),
              if (_selectedUniversityId != null)
                DropdownMenuItem<String>(
                  value: '___ADD_NEW___',
                  child: Container(
                    constraints: const BoxConstraints(minHeight: 48),
                    child: Row(
                      children: [
                        Icon(Icons.add, color: AppColors.primary, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Add New Department',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
            onChanged: _selectedUniversityId == null ? null : (String? value) {
              if (value == '___ADD_NEW___') {
                _showAddDepartmentDialog();
              } else {
                setState(() {
                  _selectedUniversityDepartmentId = value;
                });
              }
            },
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please select your department';
              }
              return null;
            },
          ),
        ),
      ],
    );
  }

  void _showAddUniversityDialog() {
    String? universityName;
    String? website;
    String? country;
    String? state;
    String? city;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Add New University',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        content: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'University Name *',
                  hintText: 'e.g., Stanford University',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (value) {
                  universityName = value.trim().isEmpty ? null : value.trim();
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Website *',
                  hintText: 'e.g., https://www.stanford.edu',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (value) {
                  website = value.trim().isEmpty ? null : value.trim();
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Country',
                        hintText: 'e.g., United States',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: AppColors.primary, width: 2),
                        ),
                      ),
                      onChanged: (value) {
                        country = value.trim().isEmpty ? null : value.trim();
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'State/Province',
                        hintText: 'e.g., California',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(color: AppColors.primary, width: 2),
                        ),
                      ),
                      onChanged: (value) {
                        state = value.trim().isEmpty ? null : value.trim();
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'City',
                  hintText: 'e.g., Stanford',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (value) {
                  city = value.trim().isEmpty ? null : value.trim();
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text(
              'Cancel',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              if (universityName != null && universityName!.isNotEmpty &&
                  website != null && website!.isNotEmpty) {
                try {
                  Navigator.of(context).pop();

                  // Show loading
                  setState(() {
                    _isLoadingUniversities = true;
                  });

                  final newUniversity = await UniversityService.addUniversity(
                    name: universityName!,
                    website: website!,
                    country: country,
                    state: state,
                    city: city,
                  );

                  // Reload universities and select the new one
                  await _loadUniversities();

                  setState(() {
                    _selectedUniversityId = newUniversity.id;
                    _selectedUniversityName = newUniversity.name;
                    _universityController.text = newUniversity.name;
                    _isLoadingUniversities = false;
                  });

                  // Load departments for the new university
                  _loadDepartmentsForUniversity(newUniversity.id);

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('University "${newUniversity.name}" added successfully'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  }
                } catch (e) {
                  setState(() {
                    _isLoadingUniversities = false;
                  });

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error adding university: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Add University'),
          ),
        ],
      ),
    );
  }

  void _showAddDepartmentDialog() {
    String? departmentName;
    String? localName;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Add New Department',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'University: $_selectedUniversityName',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Department Name *',
                hintText: 'e.g., Computer Science',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
              onChanged: (value) {
                departmentName = value.trim().isEmpty ? null : value.trim();
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Local Name (optional)',
                hintText: 'e.g., EECS (if different from standard name)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
              onChanged: (value) {
                localName = value.trim().isEmpty ? null : value.trim();
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text(
              'Cancel',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              if (departmentName != null && departmentName!.isNotEmpty) {
                try {
                  Navigator.of(context).pop();

                  // Show loading
                  setState(() {
                    _isLoadingDepartments = true;
                  });

                  final newUniversityDepartment = await UniversityDepartmentService.createNewDepartmentForUniversity(
                    universityId: _selectedUniversityId!,
                    departmentName: departmentName!,
                    localName: localName,
                  );

                  // Reload departments and select the new one
                  await _loadDepartmentsForUniversity(_selectedUniversityId!);

                  setState(() {
                    _selectedUniversityDepartmentId = newUniversityDepartment.id;
                  });

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Department "${newUniversityDepartment.displayName}" added successfully'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  }
                } catch (e) {
                  setState(() {
                    _isLoadingDepartments = false;
                  });

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error adding department: $e'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Add Department'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _nameController.dispose();
    _universityController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
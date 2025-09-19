// lib/presentation/screens/auth/verify_email_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../services/auth_service.dart';

class VerifyEmailScreen extends StatefulWidget {
  final String token;

  const VerifyEmailScreen({
    Key? key,
    required this.token,
  }) : super(key: key);

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  bool _isLoading = true;
  bool _isSuccess = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _verifyEmail();
  }

  Future<void> _verifyEmail() async {
    try {
      await AuthService.verifyEmail(widget.token);
      setState(() {
        _isLoading = false;
        _isSuccess = true;
      });

      // Auto-redirect to sign in after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/sign-in');
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _isSuccess = false;
        _errorMessage = _getErrorMessage(e);
      });
    }
  }

  String _getErrorMessage(dynamic error) {
    if (error.toString().contains('404')) {
      return 'Invalid or expired verification link. Please request a new verification email.';
    } else if (error.toString().contains('400')) {
      return 'This email has already been verified.';
    } else {
      return 'Email verification failed. Please try again or contact support.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: _isLoading
                          ? AppColors.primary.withOpacity(0.1)
                          : _isSuccess
                              ? AppColors.success.withOpacity(0.1)
                              : AppColors.error.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: _isLoading
                        ? CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                          )
                        : Icon(
                            _isSuccess ? Icons.check_circle_outline : Icons.error_outline,
                            size: 60,
                            color: _isSuccess ? AppColors.success : AppColors.error,
                          ),
                  ),
                  const SizedBox(height: 32),

                  // Title
                  Text(
                    _isLoading
                        ? 'Verifying Email...'
                        : _isSuccess
                            ? 'Email Verified!'
                            : 'Verification Failed',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: _isLoading
                          ? AppColors.textPrimary
                          : _isSuccess
                              ? AppColors.success
                              : AppColors.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),

                  // Description
                  Text(
                    _isLoading
                        ? 'Please wait while we verify your email address...'
                        : _isSuccess
                            ? 'Your email has been successfully verified! You can now sign in to your account.'
                            : _errorMessage ?? 'An error occurred during verification.',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  if (_isSuccess) ...[
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.success),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline, color: AppColors.success, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Redirecting to sign in page in 3 seconds...',
                              style: TextStyle(
                                color: AppColors.success,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 32),

                  // Action buttons
                  if (!_isLoading) ...[
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pushReplacementNamed(context, '/sign-in');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isSuccess ? AppColors.success : AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          _isSuccess ? 'Continue to Sign In' : 'Go to Sign In',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),

                    if (!_isSuccess) ...[
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pushReplacementNamed(context, '/sign-up');
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            side: BorderSide(color: AppColors.primary),
                          ),
                          child: Text(
                            'Request New Verification Email',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
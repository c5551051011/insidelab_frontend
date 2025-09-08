// presentation/screens/verification/verification_flow_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/verification.dart';
import '../../../services/verification_service.dart';
import '../../widgets/common/header_navigation.dart';

class VerificationFlowScreen extends StatefulWidget {
  const VerificationFlowScreen({Key? key}) : super(key: key);

  @override
  State<VerificationFlowScreen> createState() => _VerificationFlowScreenState();
}

class _VerificationFlowScreenState extends State<VerificationFlowScreen> {
  int currentStep = 0;
  VerificationMethod? selectedMethod;
  final _formKey = GlobalKey<FormState>();
  
  // Form controllers
  final _universityController = TextEditingController();
  final _departmentController = TextEditingController();
  final _labNameController = TextEditingController();
  final _advisorNameController = TextEditingController();
  final _advisorEmailController = TextEditingController();
  final _positionController = TextEditingController();
  final _researchAreaController = TextEditingController();
  
  bool _isSubmitting = false;

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
                _buildHeader(),
                const SizedBox(height: 32),
                _buildStepper(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Become a Verified Service Provider',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Verify your lab affiliation to start offering services like mock interviews and CV reviews. Help fellow students while earning money.',
          style: TextStyle(
            fontSize: 18,
            color: AppColors.textSecondary,
            height: 1.5,
            fontFamily: 'Inter',
          ),
        ),
      ],
    );
  }

  Widget _buildStepper() {
    return Theme(
      data: Theme.of(context).copyWith(
        colorScheme: Theme.of(context).colorScheme.copyWith(
          primary: AppColors.primary,
        ),
      ),
      child: Stepper(
        currentStep: currentStep,
        onStepTapped: (step) {
          if (step <= currentStep) {
            setState(() {
              currentStep = step;
            });
          }
        },
        controlsBuilder: (context, details) {
          return Row(
            children: [
              if (details.stepIndex < 2)
                ElevatedButton(
                  onPressed: details.onStepContinue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: Text(details.stepIndex == 1 ? 'Submit Request' : 'Continue'),
                ),
              const SizedBox(width: 12),
              if (details.stepIndex > 0)
                TextButton(
                  onPressed: details.onStepCancel,
                  child: const Text('Back'),
                ),
            ],
          );
        },
        steps: [
          Step(
            title: const Text('Choose Verification Method'),
            content: _buildMethodSelection(),
            isActive: currentStep >= 0,
            state: currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Lab Information'),
            content: _buildLabInformation(),
            isActive: currentStep >= 1,
            state: currentStep > 1 ? StepState.complete : 
                   currentStep == 1 ? StepState.indexed : StepState.disabled,
          ),
          Step(
            title: const Text('Review & Submit'),
            content: _buildReviewSubmit(),
            isActive: currentStep >= 2,
            state: currentStep == 2 ? StepState.indexed : StepState.disabled,
          ),
        ],
      ),
    );
  }

  Widget _buildMethodSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'How would you like to verify your lab affiliation?',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 20),
        ...VerificationMethod.values.map((method) => _buildMethodOption(method)),
      ],
    );
  }

  Widget _buildMethodOption(VerificationMethod method) {
    final isSelected = selectedMethod == method;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          setState(() {
            selectedMethod = method;
          });
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
            color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.transparent,
          ),
          child: Row(
            children: [
              Radio<VerificationMethod>(
                value: method,
                groupValue: selectedMethod,
                onChanged: (value) {
                  setState(() {
                    selectedMethod = value;
                  });
                },
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getMethodTitle(method),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _getMethodDescription(method),
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getMethodTitle(VerificationMethod method) {
    switch (method) {
      case VerificationMethod.universityEmail:
        return 'University Email Verification';
      case VerificationMethod.advisorConfirmation:
        return 'Advisor Confirmation';
      case VerificationMethod.labWebsiteListing:
        return 'Lab Website Listing';
      case VerificationMethod.publicationVerification:
        return 'Publication Verification';
      case VerificationMethod.manualReview:
        return 'Manual Document Review';
    }
  }

  String _getMethodDescription(VerificationMethod method) {
    switch (method) {
      case VerificationMethod.universityEmail:
        return 'Verify using your university email address (.edu domain)';
      case VerificationMethod.advisorConfirmation:
        return 'Your advisor will receive an email to confirm your affiliation';
      case VerificationMethod.labWebsiteListing:
        return 'Show that you\'re listed on your lab\'s website';
      case VerificationMethod.publicationVerification:
        return 'Verify through your published research papers';
      case VerificationMethod.manualReview:
        return 'Submit documents for manual review by our team';
    }
  }

  Widget _buildLabInformation() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tell us about your lab affiliation',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
              fontFamily: 'Inter',
            ),
          ),
          const SizedBox(height: 20),
          _buildFormField(
            controller: _universityController,
            label: 'University',
            hint: 'e.g., Massachusetts Institute of Technology',
            required: true,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _departmentController,
            label: 'Department',
            hint: 'e.g., Computer Science',
            required: true,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _labNameController,
            label: 'Lab Name',
            hint: 'e.g., Artificial Intelligence Lab',
            required: true,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _advisorNameController,
            label: 'Advisor Name',
            hint: 'e.g., Dr. Jane Smith',
            required: true,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _advisorEmailController,
            label: 'Advisor Email',
            hint: 'e.g., jsmith@university.edu',
            required: true,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _positionController,
            label: 'Your Position',
            hint: 'e.g., PhD Student, MS Student, Postdoc',
            required: true,
          ),
          const SizedBox(height: 16),
          _buildFormField(
            controller: _researchAreaController,
            label: 'Research Area',
            hint: 'e.g., Machine Learning, Robotics',
            required: false,
          ),
        ],
      ),
    );
  }

  Widget _buildFormField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required bool required,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: required ? '$label *' : label,
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.primary),
        ),
      ),
      validator: required ? (value) {
        if (value == null || value.trim().isEmpty) {
          return '$label is required';
        }
        if (label == 'Advisor Email') {
          if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(value)) {
            return 'Please enter a valid email address';
          }
        }
        return null;
      } : null,
    );
  }

  Widget _buildReviewSubmit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review your information',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
            fontFamily: 'Inter',
          ),
        ),
        const SizedBox(height: 20),
        _buildReviewCard(),
        const SizedBox(height: 24),
        if (_isSubmitting)
          const Center(child: CircularProgressIndicator())
        else
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submitVerificationRequest,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Submit Verification Request',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildReviewCard() {
    return Card(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildReviewItem('Verification Method', _getMethodTitle(selectedMethod!)),
            _buildReviewItem('University', _universityController.text),
            _buildReviewItem('Department', _departmentController.text),
            _buildReviewItem('Lab Name', _labNameController.text),
            _buildReviewItem('Advisor', _advisorNameController.text),
            _buildReviewItem('Advisor Email', _advisorEmailController.text),
            _buildReviewItem('Position', _positionController.text),
            if (_researchAreaController.text.isNotEmpty)
              _buildReviewItem('Research Area', _researchAreaController.text),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _submitVerificationRequest() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final labData = LabAffiliationData(
        university: _universityController.text.trim(),
        department: _departmentController.text.trim(),
        labName: _labNameController.text.trim(),
        advisorName: _advisorNameController.text.trim(),
        advisorEmail: _advisorEmailController.text.trim(),
        position: _positionController.text.trim(),
        researchArea: _researchAreaController.text.trim().isNotEmpty 
          ? _researchAreaController.text.trim() 
          : null,
      );

      await VerificationService().submitVerificationRequest(
        userId: 'current_user_id', // Get from auth provider
        method: selectedMethod!,
        labData: labData,
        documents: [], // Documents would be uploaded in a separate step
      );

      // Show success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Verification request submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  void dispose() {
    _universityController.dispose();
    _departmentController.dispose();
    _labNameController.dispose();
    _advisorNameController.dispose();
    _advisorEmailController.dispose();
    _positionController.dispose();
    _researchAreaController.dispose();
    super.dispose();
  }
}
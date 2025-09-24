import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/mentor.dart';
import '../../widgets/common/header_navigation.dart';

class CVReviewScreen extends StatefulWidget {
  const CVReviewScreen({Key? key}) : super(key: key);

  @override
  State<CVReviewScreen> createState() => _CVReviewScreenState();
}

class _CVReviewScreenState extends State<CVReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  
  String? _selectedField;
  String? _selectedMentor;
  String? _selectedTurnaround;
  File? _uploadedCV;
  bool _isLoading = false;
  
  final List<String> _fields = [
    'Computer Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Engineering',
    'Psychology',
    'Economics',
    'Other'
  ];
  
  final Map<String, String> _turnaroundOptions = {
    '24_hours': '24 Hours - \$35',
    '48_hours': '48 Hours - \$30',
    '72_hours': '72 Hours - \$25',
  };

  List<Mentor> _availableMentors = [];

  @override
  void initState() {
    super.initState();
    _loadMentors();
  }

  void _loadMentors() {
    // Mock mentors for CV review service
    _availableMentors = [
      Mentor(
        id: 'mentor1',
        userId: 'user1',
        name: 'Sarah Chen',
        university: 'MIT',
        department: 'Computer Science',
        degree: 'PhD',
        field: 'Computer Science',
        yearInProgram: 4,
        profileImageUrl: '',
        bio: 'PhD in AI/ML with 3 years of industry experience. Specialized in helping CS students craft compelling academic CVs.',
        expertise: ['Academic CV Writing', 'Research Experience', 'Technical Skills'],
        languages: ['English', 'Mandarin'],
        serviceRates: {'cv_review': 30.0},
        rating: 4.9,
        totalSessions: 127,
        availableServices: ['cv_review', 'mentorship'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now(),
      ),
      Mentor(
        id: 'mentor2',
        userId: 'user2',
        name: 'Dr. James Wilson',
        university: 'Stanford',
        department: 'Biology',
        degree: 'PhD',
        field: 'Biology',
        yearInProgram: 5,
        profileImageUrl: '',
        bio: 'Postdoc in molecular biology. Expert in crafting CVs for life sciences and medical school applications.',
        expertise: ['Life Sciences CV', 'Medical School Applications', 'Research Publications'],
        languages: ['English'],
        serviceRates: {'cv_review': 35.0},
        rating: 4.8,
        totalSessions: 89,
        availableServices: ['cv_review', 'mentorship'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now(),
      ),
    ];
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 32),
            _buildBookingForm(),
            const SizedBox(height: 32),
            _buildServiceDetails(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary.withOpacity(0.1), Colors.transparent],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '📄 Professional CV Review',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Get your academic CV reviewed by successful PhD students in your field. Receive detailed feedback on content, formatting, and field-specific best practices.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Book Your CV Review',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 20),
          
          // Field Selection
          DropdownButtonFormField<String>(
            value: _selectedField,
            decoration: const InputDecoration(
              labelText: 'Your Field of Study',
              prefixIcon: Icon(Icons.school),
            ),
            items: _fields.map((field) => DropdownMenuItem(
              value: field,
              child: Text(field),
            )).toList(),
            onChanged: (value) {
              setState(() {
                _selectedField = value;
                _selectedMentor = null; // Reset mentor selection
              });
            },
            validator: (value) => value == null ? 'Please select your field' : null,
          ),
          
          const SizedBox(height: 20),
          
          // Mentor Selection
          if (_selectedField != null) ...[
            Text(
              'Choose Your Reviewer',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ..._getFilteredMentors().map((mentor) => _buildMentorCard(mentor)),
          ],
          
          const SizedBox(height: 20),
          
          // Turnaround Selection
          DropdownButtonFormField<String>(
            value: _selectedTurnaround,
            decoration: const InputDecoration(
              labelText: 'Turnaround Time',
              prefixIcon: Icon(Icons.schedule),
            ),
            items: _turnaroundOptions.entries.map((entry) => DropdownMenuItem(
              value: entry.key,
              child: Text(entry.value),
            )).toList(),
            onChanged: (value) {
              setState(() {
                _selectedTurnaround = value;
              });
            },
            validator: (value) => value == null ? 'Please select turnaround time' : null,
          ),
          
          const SizedBox(height: 20),
          
          // CV Upload
          _buildFileUpload(),
          
          const SizedBox(height: 20),
          
          // Additional Notes
          TextFormField(
            controller: _notesController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Additional Notes (Optional)',
              hintText: 'Any specific areas you\'d like us to focus on?',
              prefixIcon: Icon(Icons.note_add),
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _canSubmit() ? _submitBooking : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.all(16),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                      'Book CV Review - ${_getPrice()}',
                      style: const TextStyle(fontSize: 16),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMentorCard(Mentor mentor) {
    final isSelected = _selectedMentor == mentor.id;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: isSelected ? AppColors.primary.withOpacity(0.1) : null,
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedMentor = mentor.id;
          });
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primary,
                child: Text(
                  mentor.name.split(' ').map((n) => n[0]).join(''),
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mentor.name,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${mentor.degree} in ${mentor.field} • ${mentor.university}',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star, size: 16, color: Colors.orange),
                        Text(' ${mentor.rating} (${mentor.totalSessions} reviews)'),
                      ],
                    ),
                  ],
                ),
              ),
              if (isSelected) Icon(Icons.check_circle, color: AppColors.primary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFileUpload() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.textTertiary),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(Icons.upload_file, size: 48, color: AppColors.textSecondary),
          const SizedBox(height: 8),
          Text(
            _uploadedCV != null ? 'CV Uploaded Successfully!' : 'Upload Your CV',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: _uploadedCV != null ? AppColors.success : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _uploadedCV != null 
                ? _uploadedCV!.path.split('/').last
                : 'PDF, DOC, or DOCX (Max 5MB)',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _selectFile,
            child: Text(_uploadedCV != null ? 'Change File' : 'Select File'),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceDetails() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.info.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.info.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info, color: AppColors.info),
              const SizedBox(width: 8),
              Text(
                'What You\'ll Receive',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildDetailItem('✅', 'Comprehensive feedback on content and structure'),
          _buildDetailItem('✅', 'Field-specific suggestions and best practices'),
          _buildDetailItem('✅', 'Formatting and design recommendations'),
          _buildDetailItem('✅', 'Highlighted strengths and improvement areas'),
          _buildDetailItem('✅', 'Before/after comparison document'),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(icon, style: TextStyle(fontSize: 16)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Mentor> _getFilteredMentors() {
    if (_selectedField == null) return [];
    return _availableMentors.where((mentor) => 
        mentor.field == _selectedField || _selectedField == 'Other'
    ).toList();
  }

  bool _canSubmit() {
    return _selectedField != null &&
           _selectedMentor != null &&
           _selectedTurnaround != null &&
           _uploadedCV != null &&
           !_isLoading;
  }

  String _getPrice() {
    if (_selectedTurnaround == null) return '\$--';
    switch (_selectedTurnaround!) {
      case '24_hours': return '\$35';
      case '48_hours': return '\$30';
      case '72_hours': return '\$25';
      default: return '\$--';
    }
  }

  void _selectFile() async {
    // Mock file selection
    setState(() {
      _uploadedCV = File('/mock/path/cv.pdf');
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('CV uploaded successfully!')),
    );
  }

  void _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isLoading = false;
    });

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.check_circle, color: AppColors.success, size: 48),
        title: Text('Booking Confirmed!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Your CV review has been booked successfully.'),
            const SizedBox(height: 16),
            Text('You\'ll receive detailed feedback within ${_getTurnaroundText()}.'),
            const SizedBox(height: 16),
            Text('We\'ll send you an email confirmation shortly.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: Text('Great!'),
          ),
        ],
      ),
    );
  }

  String _getTurnaroundText() {
    switch (_selectedTurnaround) {
      case '24_hours': return '24 hours';
      case '48_hours': return '48 hours';
      case '72_hours': return '72 hours';
      default: return 'the selected timeframe';
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }
}
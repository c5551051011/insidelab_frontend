import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/mentor.dart';
import '../../widgets/common/app_bar_widget.dart';

class MockInterviewScreen extends StatefulWidget {
  const MockInterviewScreen({Key? key}) : super(key: key);

  @override
  State<MockInterviewScreen> createState() => _MockInterviewScreenState();
}

class _MockInterviewScreenState extends State<MockInterviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  
  String? _selectedField;
  String? _selectedMentor;
  String? _selectedDate;
  String? _selectedTime;
  String? _interviewType;
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
  
  final List<String> _interviewTypes = [
    'PhD Program Interview',
    'Research Position Interview',
    'Fellowship Interview',
    'General Graduate School Interview'
  ];

  final List<String> _availableDates = [
    'Today',
    'Tomorrow', 
    'This Weekend',
    'Next Week'
  ];

  final List<String> _timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM'
  ];

  List<Mentor> _availableMentors = [];

  @override
  void initState() {
    super.initState();
    _loadMentors();
  }

  void _loadMentors() {
    // Mock mentors for interview service
    _availableMentors = [
      Mentor(
        id: 'mentor3',
        userId: 'user3',
        name: 'Dr. Emily Rodriguez',
        university: 'Harvard',
        department: 'Computer Science',
        degree: 'PhD',
        field: 'Computer Science',
        yearInProgram: 5,
        profileImageUrl: '',
        bio: 'PhD in HCI with experience in tech industry interviews. Conducted 50+ mock interviews with 95% success rate.',
        expertise: ['Technical Interviews', 'Research Presentations', 'PhD Applications'],
        languages: ['English', 'Spanish'],
        serviceRates: {'mock_interview': 45.0},
        rating: 4.9,
        totalSessions: 73,
        availableServices: ['mock_interview', 'mentorship'],
        availability: {
          'Monday': ['9:00 AM - 10:00 AM', '2:00 PM - 3:00 PM'],
          'Wednesday': ['10:00 AM - 11:00 AM', '7:00 PM - 8:00 PM'],
          'Friday': ['3:00 PM - 4:00 PM', '8:00 PM - 9:00 PM']
        },
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now(),
      ),
      Mentor(
        id: 'mentor4',
        userId: 'user4',
        name: 'Alex Thompson',
        university: 'UC Berkeley',
        department: 'Biology',
        degree: 'PhD',
        field: 'Biology',
        yearInProgram: 4,
        profileImageUrl: '',
        bio: 'PhD in Molecular Biology. Previously worked at biotech companies. Specializes in life sciences interviews.',
        expertise: ['Life Sciences Interviews', 'Research Methodology', 'Academic Presentations'],
        languages: ['English'],
        serviceRates: {'mock_interview': 40.0},
        rating: 4.8,
        totalSessions: 61,
        availableServices: ['mock_interview', 'mentorship'],
        availability: {
          'Tuesday': ['9:00 AM - 10:00 AM', '3:00 PM - 4:00 PM'],
          'Thursday': ['10:00 AM - 11:00 AM', '7:00 PM - 8:00 PM'],
          'Saturday': ['2:00 PM - 3:00 PM', '8:00 PM - 9:00 PM']
        },
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
      appBar: const InsideLabAppBar(
        title: 'Mock Interviews',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 32),
            _buildBookingForm(),
            const SizedBox(height: 32),
            _buildInterviewProcess(),
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
            '🎤 Mock Interview Practice',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Practice your graduate school interviews with experienced PhD students. Get personalized feedback and build confidence for the real thing.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildQuickStat('1 Hour', 'Session Length'),
              const SizedBox(width: 20),
              _buildQuickStat('Live Video', 'Format'),
              const SizedBox(width: 20),
              _buildQuickStat('Recording', 'Included'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildBookingForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Schedule Your Mock Interview',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 20),
          
          // Interview Type
          DropdownButtonFormField<String>(
            value: _interviewType,
            decoration: const InputDecoration(
              labelText: 'Interview Type',
              prefixIcon: Icon(Icons.psychology),
            ),
            items: _interviewTypes.map((type) => DropdownMenuItem(
              value: type,
              child: Text(type),
            )).toList(),
            onChanged: (value) {
              setState(() {
                _interviewType = value;
              });
            },
            validator: (value) => value == null ? 'Please select interview type' : null,
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
                _selectedMentor = null;
              });
            },
            validator: (value) => value == null ? 'Please select your field' : null,
          ),
          
          const SizedBox(height: 20),
          
          // Interviewer Selection
          if (_selectedField != null) ...[
            Text(
              'Choose Your Interviewer',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ..._getFilteredMentors().map((mentor) => _buildInterviewerCard(mentor)),
          ],
          
          const SizedBox(height: 20),
          
          // Date Selection
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedDate,
                  decoration: const InputDecoration(
                    labelText: 'Preferred Date',
                    prefixIcon: Icon(Icons.calendar_today),
                  ),
                  items: _availableDates.map((date) => DropdownMenuItem(
                    value: date,
                    child: Text(date),
                  )).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedDate = value;
                      _selectedTime = null;
                    });
                  },
                  validator: (value) => value == null ? 'Please select date' : null,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedTime,
                  decoration: const InputDecoration(
                    labelText: 'Time Slot',
                    prefixIcon: Icon(Icons.access_time),
                  ),
                  items: _timeSlots.map((time) => DropdownMenuItem(
                    value: time,
                    child: Text(time),
                  )).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedTime = value;
                    });
                  },
                  validator: (value) => value == null ? 'Please select time' : null,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Special Focus Areas
          TextFormField(
            controller: _notesController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Focus Areas (Optional)',
              hintText: 'Any specific topics or areas you\'d like to practice?',
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
                      'Book Mock Interview - ${_getPrice()}',
                      style: const TextStyle(fontSize: 16),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewerCard(Mentor mentor) {
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
          child: Column(
            children: [
              Row(
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
                            Text(' ${mentor.rating} (${mentor.totalSessions} sessions)'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    children: [
                      Text(
                        '\$${mentor.serviceRates['mock_interview']?.toInt()}/hr',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.success,
                        ),
                      ),
                      if (isSelected) Icon(Icons.check_circle, color: AppColors.primary),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                mentor.bio,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: mentor.expertise.map((skill) => Chip(
                  label: Text(skill, style: TextStyle(fontSize: 12)),
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                )).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInterviewProcess() {
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
                'How It Works',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildProcessStep('1', 'Pre-Interview Prep', 
                            'Share your background and specific areas you want to focus on'),
          _buildProcessStep('2', 'Live Video Interview', 
                            '45-minute mock interview with field-specific questions'),
          _buildProcessStep('3', 'Real-time Feedback', 
                            'Immediate feedback on your responses and presentation'),
          _buildProcessStep('4', 'Detailed Report', 
                            'Written feedback with improvement suggestions and resources'),
          _buildProcessStep('5', 'Recording Access', 
                            'Review your performance with the session recording'),
        ],
      ),
    );
  }

  Widget _buildProcessStep(String number, String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: AppColors.info,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
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
    );
  }

  List<Mentor> _getFilteredMentors() {
    if (_selectedField == null) return [];
    return _availableMentors.where((mentor) => 
        mentor.field == _selectedField || _selectedField == 'Other'
    ).toList();
  }

  bool _canSubmit() {
    return _interviewType != null &&
           _selectedField != null &&
           _selectedMentor != null &&
           _selectedDate != null &&
           _selectedTime != null &&
           !_isLoading;
  }

  String _getPrice() {
    if (_selectedMentor == null) return '\$--';
    final mentor = _availableMentors.firstWhere((m) => m.id == _selectedMentor);
    return '\$${mentor.serviceRates['mock_interview']?.toInt() ?? 45}';
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
        title: Text('Interview Scheduled!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Your mock interview has been scheduled successfully.'),
            const SizedBox(height: 16),
            Text('Date: $_selectedDate'),
            Text('Time: $_selectedTime'),
            const SizedBox(height: 16),
            Text('We\'ll send you a calendar invite and video link shortly.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: Text('Perfect!'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }
}
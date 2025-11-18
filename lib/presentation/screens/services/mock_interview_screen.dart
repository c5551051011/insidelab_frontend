import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/mentor.dart';
import '../../widgets/common/header_navigation.dart';

// Mock file picker functionality since file_picker isn't available
class PlatformFile {
  final String name;
  final int size;
  final String path;

  PlatformFile({required this.name, required this.size, required this.path});
}

class FilePickerResult {
  final List<PlatformFile> files;

  FilePickerResult({required this.files});
}

class FilePicker {
  static FilePicker platform = FilePicker();

  Future<FilePickerResult?> pickFiles({
    required FileType type,
    List<String>? allowedExtensions,
    bool allowMultiple = false,
  }) async {
    // Mock file picker - in real app this would use actual file_picker package
    await Future.delayed(const Duration(milliseconds: 500));
    return FilePickerResult(files: [
      PlatformFile(
        name: 'sample_document.pdf',
        size: 1024 * 1024, // 1MB
        path: '/mock/path/sample_document.pdf',
      ),
    ]);
  }
}

enum FileType { custom }

class MockInterviewScreen extends StatefulWidget {
  const MockInterviewScreen({Key? key}) : super(key: key);

  @override
  State<MockInterviewScreen> createState() => _MockInterviewScreenState();
}

class _MockInterviewScreenState extends State<MockInterviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final _researchDescriptionController = TextEditingController();
  final _personalIntroController = TextEditingController();
  final _interviewGoalsController = TextEditingController();
  final _backgroundController = TextEditingController();
  final _specificQuestionsController = TextEditingController();

  String? _selectedField;
  String? _selectedSubField;
  String? _selectedMentor;
  DateTime? _selectedDate;
  String? _selectedTime;
  String? _interviewType;
  String? _currentPosition;
  String? _targetProgram;
  List<String> _interviewFocus = [];
  Map<String, PlatformFile> _uploadedFiles = {};
  bool _isLoading = false;

  // Add scroll controller for long form
  final ScrollController _scrollController = ScrollController();
  
  final Map<String, List<String>> _fields = {
    'Computer Science': ['Machine Learning', 'AI', 'HCI', 'Systems', 'Theory', 'Security', 'Graphics', 'Software Engineering'],
    'Biology': ['Molecular Biology', 'Cell Biology', 'Biochemistry', 'Neuroscience', 'Genetics', 'Ecology', 'Microbiology'],
    'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'],
    'Physics': ['Theoretical Physics', 'Experimental Physics', 'Condensed Matter', 'Particle Physics', 'Astrophysics'],
    'Engineering': ['Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biomedical', 'Materials', 'Environmental'],
    'Psychology': ['Clinical Psychology', 'Cognitive Psychology', 'Social Psychology', 'Developmental', 'Neuropsychology'],
    'Economics': ['Macroeconomics', 'Microeconomics', 'Econometrics', 'Behavioral Economics', 'Development Economics'],
    'Mathematics': ['Pure Mathematics', 'Applied Mathematics', 'Statistics', 'Operations Research'],
    'Other': ['Specify in research description']
  };

  final List<String> _interviewTypes = [
    'PhD Program Interview',
    'Masters Program Interview',
    'Research Position Interview',
    'Fellowship Interview',
    'Postdoc Interview',
    'Industry Research Interview',
    'Academic Job Interview'
  ];

  final List<String> _currentPositions = [
    'Undergraduate Student',
    'Masters Student',
    'PhD Student',
    'Research Assistant',
    'Industry Professional',
    'Postdoc',
    'Other'
  ];

  final List<String> _targetPrograms = [
    'PhD Program',
    'Masters Program',
    'Research Position',
    'Fellowship',
    'Postdoc Position',
    'Industry Research Role',
    'Academic Position'
  ];

  final List<String> _focusAreas = [
    'Technical Questions',
    'Research Presentation',
    'Research Discussion',
    'Career Goals',
    'Personal Statement Discussion',
    'Behavioral Questions',
    'Problem Solving',
    'Teaching Philosophy',
    'Publications Discussion',
    'Future Research Plans'
  ];

  final List<String> _timeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM',
    '9:00 PM - 10:00 PM'
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
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        controller: _scrollController,
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 32),
                _buildComprehensiveForm(),
                const SizedBox(height: 32),
                _buildInterviewProcess(),
              ],
            ),
          ),
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

  Widget _buildComprehensiveForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section 1: Basic Information
          _buildSectionHeader('1. Basic Information', Icons.person),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _currentPosition,
                  decoration: const InputDecoration(
                    labelText: 'Current Position *',
                    prefixIcon: Icon(Icons.work),
                    border: OutlineInputBorder(),
                  ),
                  items: _currentPositions.map((position) => DropdownMenuItem(
                    value: position,
                    child: Text(position),
                  )).toList(),
                  onChanged: (value) => setState(() => _currentPosition = value),
                  validator: (value) => value == null ? 'Please select your current position' : null,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _targetProgram,
                  decoration: const InputDecoration(
                    labelText: 'Target Position *',
                    prefixIcon: Icon(Icons.flag),
                    border: OutlineInputBorder(),
                  ),
                  items: _targetPrograms.map((program) => DropdownMenuItem(
                    value: program,
                    child: Text(program),
                  )).toList(),
                  onChanged: (value) => setState(() => _targetProgram = value),
                  validator: (value) => value == null ? 'Please select your target position' : null,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            value: _interviewType,
            decoration: const InputDecoration(
              labelText: 'Interview Type *',
              prefixIcon: Icon(Icons.psychology),
              border: OutlineInputBorder(),
            ),
            items: _interviewTypes.map((type) => DropdownMenuItem(
              value: type,
              child: Text(type),
            )).toList(),
            onChanged: (value) => setState(() => _interviewType = value),
            validator: (value) => value == null ? 'Please select interview type' : null,
          ),

          const SizedBox(height: 32),

          // Section 2: Research Background
          _buildSectionHeader('2. Research Background', Icons.science),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedField,
                  decoration: const InputDecoration(
                    labelText: 'Primary Field *',
                    prefixIcon: Icon(Icons.school),
                    border: OutlineInputBorder(),
                  ),
                  items: _fields.keys.map((field) => DropdownMenuItem(
                    value: field,
                    child: Text(field),
                  )).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedField = value;
                      _selectedSubField = null;
                      _selectedMentor = null;
                    });
                  },
                  validator: (value) => value == null ? 'Please select your field' : null,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedSubField,
                  decoration: const InputDecoration(
                    labelText: 'Specialization',
                    prefixIcon: Icon(Icons.psychology_alt),
                    border: OutlineInputBorder(),
                  ),
                  items: _selectedField != null
                    ? _fields[_selectedField!]!.map((subField) => DropdownMenuItem(
                        value: subField,
                        child: Text(subField),
                      )).toList()
                    : [],
                  onChanged: (value) => setState(() => _selectedSubField = value),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          TextFormField(
            controller: _researchDescriptionController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Research Description *',
              hintText: 'Describe your current research, interests, and any specific projects you want to discuss...',
              prefixIcon: Icon(Icons.science),
              border: OutlineInputBorder(),
            ),
            validator: (value) => value?.trim().isEmpty == true ? 'Please describe your research background' : null,
          ),

          const SizedBox(height: 32),

          // Section 3: Personal Introduction
          _buildSectionHeader('3. Personal Introduction & Goals', Icons.person_outline),
          const SizedBox(height: 16),

          TextFormField(
            controller: _personalIntroController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Personal Introduction *',
              hintText: 'Tell us about yourself, your background, motivation, and what makes you unique...',
              prefixIcon: Icon(Icons.person),
              border: OutlineInputBorder(),
            ),
            validator: (value) => value?.trim().isEmpty == true ? 'Please provide a personal introduction' : null,
          ),

          const SizedBox(height: 16),

          TextFormField(
            controller: _interviewGoalsController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Interview Goals & Focus *',
              hintText: 'What specific aspects do you want to practice? What are your concerns or areas for improvement?',
              prefixIcon: Icon(Icons.flag),
              border: OutlineInputBorder(),
            ),
            validator: (value) => value?.trim().isEmpty == true ? 'Please specify your interview goals' : null,
          ),

          const SizedBox(height: 16),

          // Interview Focus Areas (Checkboxes)
          Text(
            'Interview Focus Areas *',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          _buildFocusAreasSelection(),

          const SizedBox(height: 32),

          // Section 4: Document Upload
          _buildSectionHeader('4. Supporting Documents', Icons.upload_file),
          const SizedBox(height: 16),
          _buildDocumentUploadSection(),

          const SizedBox(height: 32),

          // Section 5: Additional Information
          _buildSectionHeader('5. Additional Information', Icons.notes),
          const SizedBox(height: 16),

          TextFormField(
            controller: _specificQuestionsController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Specific Questions or Concerns',
              hintText: 'Any specific questions you want to practice or particular concerns about your interview?',
              prefixIcon: Icon(Icons.help_outline),
              border: OutlineInputBorder(),
            ),
          ),

          const SizedBox(height: 32),

          // Section 6: Schedule & Mentor Selection
          _buildSectionHeader('6. Schedule & Mentor Selection', Icons.schedule),
          const SizedBox(height: 16),

          _buildDateTimeSelection(),

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

          const SizedBox(height: 32),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _canSubmit() ? _submitBooking : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.all(20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                      'Schedule Mock Interview - ${_getPrice()}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 24),
        const SizedBox(width: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildFocusAreasSelection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select the areas you want to focus on during your interview:',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _focusAreas.map((area) {
              final isSelected = _interviewFocus.contains(area);
              return FilterChip(
                label: Text(area),
                selected: isSelected,
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _interviewFocus.add(area);
                    } else {
                      _interviewFocus.remove(area);
                    }
                  });
                },
                backgroundColor: Colors.grey.withOpacity(0.1),
                selectedColor: AppColors.primary.withOpacity(0.2),
                checkmarkColor: AppColors.primary,
              );
            }).toList(),
          ),
          if (_interviewFocus.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Please select at least one focus area',
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDocumentUploadSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Upload supporting documents to help your interviewer prepare:',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          _buildDocumentUploadButton('CV/Resume', 'cv'),
          const SizedBox(height: 12),
          _buildDocumentUploadButton('Personal Statement', 'personal_statement'),
          const SizedBox(height: 12),
          _buildDocumentUploadButton('Research Statement', 'research_statement'),
          const SizedBox(height: 12),
          _buildDocumentUploadButton('Transcript', 'transcript'),
          const SizedBox(height: 12),
          _buildDocumentUploadButton('Portfolio/Other', 'other'),

          if (_uploadedFiles.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'Uploaded Files:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            ..._uploadedFiles.entries.map((entry) => _buildUploadedFileCard(entry.key, entry.value)),
          ],
        ],
      ),
    );
  }

  Widget _buildDocumentUploadButton(String label, String type) {
    final isUploaded = _uploadedFiles.containsKey(type);

    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => _pickDocument(type),
        icon: Icon(
          isUploaded ? Icons.check_circle : Icons.upload_file,
          color: isUploaded ? AppColors.success : AppColors.primary,
        ),
        label: Text(
          isUploaded ? '$label (Uploaded)' : 'Upload $label',
          style: TextStyle(
            color: isUploaded ? AppColors.success : AppColors.primary,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: BorderSide(
            color: isUploaded ? AppColors.success : AppColors.primary,
          ),
          padding: const EdgeInsets.all(12),
        ),
      ),
    );
  }

  Widget _buildUploadedFileCard(String type, PlatformFile file) {
    return Card(
      child: ListTile(
        leading: Icon(Icons.description, color: AppColors.success),
        title: Text(file.name),
        subtitle: Text('${(file.size / 1024 / 1024).toStringAsFixed(1)} MB'),
        trailing: IconButton(
          onPressed: () {
            setState(() {
              _uploadedFiles.remove(type);
            });
          },
          icon: Icon(Icons.delete, color: Colors.red),
        ),
      ),
    );
  }

  Widget _buildDateTimeSelection() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => _selectDate(),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Interview Date *',
                    prefixIcon: Icon(Icons.calendar_today),
                    border: OutlineInputBorder(),
                  ),
                  child: Text(
                    _selectedDate != null
                        ? '${_selectedDate!.month}/${_selectedDate!.day}/${_selectedDate!.year}'
                        : 'Select date',
                    style: TextStyle(
                      color: _selectedDate != null ? AppColors.textPrimary : Colors.grey,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selectedTime,
                decoration: const InputDecoration(
                  labelText: 'Time Slot *',
                  prefixIcon: Icon(Icons.access_time),
                  border: OutlineInputBorder(),
                ),
                items: _timeSlots.map((time) => DropdownMenuItem(
                  value: time,
                  child: Text(time),
                )).toList(),
                onChanged: (value) => setState(() => _selectedTime = value),
                validator: (value) => value == null ? 'Please select time' : null,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.primary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickDocument(String type) async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
        allowMultiple: false,
      );

      if (result != null && result.files.isNotEmpty) {
        setState(() {
          _uploadedFiles[type] = result.files.first;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${result.files.first.name} uploaded successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error uploading file: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  List<Mentor> _getFilteredMentors() {
    if (_selectedField == null) return [];
    return _availableMentors.where((mentor) =>
        mentor.field == _selectedField || _selectedField == 'Other'
    ).toList();
  }

  bool _canSubmit() {
    return _currentPosition != null &&
           _targetProgram != null &&
           _interviewType != null &&
           _selectedField != null &&
           _researchDescriptionController.text.trim().isNotEmpty &&
           _personalIntroController.text.trim().isNotEmpty &&
           _interviewGoalsController.text.trim().isNotEmpty &&
           _interviewFocus.isNotEmpty &&
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
    _researchDescriptionController.dispose();
    _personalIntroController.dispose();
    _interviewGoalsController.dispose();
    _backgroundController.dispose();
    _specificQuestionsController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
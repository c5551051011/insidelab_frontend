import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/mentor.dart';
import '../../widgets/common/header_navigation.dart';

class MentorshipMarketplaceScreen extends StatefulWidget {
  const MentorshipMarketplaceScreen({Key? key}) : super(key: key);

  @override
  State<MentorshipMarketplaceScreen> createState() => _MentorshipMarketplaceScreenState();
}

class _MentorshipMarketplaceScreenState extends State<MentorshipMarketplaceScreen> {
  List<Mentor> _allMentors = [];
  List<Mentor> _filteredMentors = [];
  String? _selectedField;
  String? _selectedService;
  double _maxPrice = 100.0;
  bool _isLoading = true;

  final List<String> _fields = [
    'All Fields',
    'Computer Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Engineering',
    'Psychology',
    'Economics',
    'Mathematics'
  ];

  final List<String> _services = [
    'All Services',
    'General Mentorship',
    'Lab-specific Advice',
    'Career Guidance',
    'Research Consultation',
    'Application Help'
  ];

  @override
  void initState() {
    super.initState();
    _loadMentors();
  }

  void _loadMentors() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    _allMentors = [
      Mentor(
        id: 'mentor5',
        userId: 'user5',
        name: 'Dr. Maria Santos',
        university: 'Stanford',
        department: 'Computer Science',
        degree: 'PhD',
        field: 'Computer Science',
        yearInProgram: 5,
        profileImageUrl: '',
        bio: 'AI/ML researcher with industry experience at Google. Passionate about helping undergrads navigate grad school applications and research opportunities.',
        expertise: ['Machine Learning', 'Research Methodology', 'Industry Transition', 'Graduate Applications'],
        languages: ['English', 'Spanish', 'Portuguese'],
        serviceRates: {'mentorship': 40.0, 'consultation': 35.0},
        rating: 4.9,
        totalSessions: 156,
        availableServices: ['mentorship', 'consultation', 'lab_advice'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now().subtract(Duration(days: 365)),
      ),
      Mentor(
        id: 'mentor6',
        userId: 'user6',
        name: 'Kevin Park',
        university: 'MIT',
        department: 'Biology',
        degree: 'PhD',
        field: 'Biology',
        yearInProgram: 4,
        profileImageUrl: '',
        bio: 'Computational biologist specializing in genomics. Previously worked at biotech startups. Happy to discuss both academic and industry career paths.',
        expertise: ['Computational Biology', 'Genomics', 'Biotech Industry', 'PhD Applications'],
        languages: ['English', 'Korean'],
        serviceRates: {'mentorship': 35.0, 'consultation': 30.0},
        rating: 4.8,
        totalSessions: 89,
        availableServices: ['mentorship', 'consultation'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now().subtract(Duration(days: 180)),
      ),
      Mentor(
        id: 'mentor7',
        userId: 'user7',
        name: 'Sarah Johnson',
        university: 'UC Berkeley',
        department: 'Psychology',
        degree: 'PhD',
        field: 'Psychology',
        yearInProgram: 6,
        profileImageUrl: '',
        bio: 'Clinical psychology researcher with expertise in mental health and wellbeing. Passionate about supporting diverse students in academia.',
        expertise: ['Clinical Psychology', 'Research Design', 'Academic Wellbeing', 'Diversity in Academia'],
        languages: ['English'],
        serviceRates: {'mentorship': 30.0, 'consultation': 25.0},
        rating: 4.9,
        totalSessions: 203,
        availableServices: ['mentorship', 'consultation', 'career_guidance'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now().subtract(Duration(days: 500)),
      ),
      Mentor(
        id: 'mentor8',
        userId: 'user8',
        name: 'Dr. Ahmed Hassan',
        university: 'Harvard',
        department: 'Engineering',
        degree: 'PhD',
        field: 'Engineering',
        yearInProgram: 7,
        profileImageUrl: '',
        bio: 'Mechanical engineering PhD with focus on renewable energy. International student with experience navigating US grad school system.',
        expertise: ['Mechanical Engineering', 'Renewable Energy', 'International Student Support', 'Research Funding'],
        languages: ['English', 'Arabic', 'French'],
        serviceRates: {'mentorship': 45.0, 'consultation': 40.0},
        rating: 4.7,
        totalSessions: 67,
        availableServices: ['mentorship', 'consultation', 'research_help'],
        availability: {},
        isVerified: true,
        isActive: true,
        joinedDate: DateTime.now().subtract(Duration(days: 200)),
      ),
    ];

    _filteredMentors = _allMentors;
    setState(() {
      _isLoading = false;
    });
  }

  void _applyFilters() {
    setState(() {
      _filteredMentors = _allMentors.where((mentor) {
        if (_selectedField != null && _selectedField != 'All Fields' && mentor.field != _selectedField) {
          return false;
        }
        
        final mentorshipRate = mentor.serviceRates['mentorship'] ?? 0.0;
        if (mentorshipRate > _maxPrice) {
          return false;
        }
        
        return true;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildHeader(),
                _buildFilters(),
                Expanded(child: _buildMentorsList()),
              ],
            ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '🤝 Find Your Perfect Mentor',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Connect with experienced graduate students for personalized guidance and lab-specific insights',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildHeaderStat('${_allMentors.length}+', 'Expert Mentors'),
              _buildHeaderStat('1000+', 'Sessions Completed'),
              _buildHeaderStat('4.8★', 'Average Rating'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border(
          bottom: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedField,
                  decoration: const InputDecoration(
                    labelText: 'Field',
                    prefixIcon: Icon(Icons.school),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: _fields.map((field) => DropdownMenuItem(
                    value: field,
                    child: Text(field, style: TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedField = value;
                    });
                    _applyFilters();
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Max Price: \$${_maxPrice.toInt()}/hr',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Slider(
                      value: _maxPrice,
                      min: 20.0,
                      max: 100.0,
                      divisions: 8,
                      onChanged: (value) {
                        setState(() {
                          _maxPrice = value;
                        });
                        _applyFilters();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMentorsList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredMentors.length,
      itemBuilder: (context, index) {
        return _buildMentorCard(_filteredMentors[index]);
      },
    );
  }

  Widget _buildMentorCard(Mentor mentor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: InkWell(
        onTap: () => _showMentorDetails(mentor),
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      mentor.name.split(' ').map((n) => n[0]).join(''),
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              mentor.name,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (mentor.isVerified) ...[
                              const SizedBox(width: 6),
                              Icon(Icons.verified, 
                                   size: 18, 
                                   color: AppColors.primary),
                            ],
                          ],
                        ),
                        Text(
                          '${mentor.degree} in ${mentor.field}',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          mentor.university,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '\$${mentor.serviceRates['mentorship']?.toInt()}/hr',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.success,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, size: 16, color: Colors.orange),
                          Text(
                            ' ${mentor.rating}',
                            style: TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                mentor.bio,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: mentor.expertise.take(3).map((skill) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    skill,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.primary,
                    ),
                  ),
                )).toList(),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Icon(Icons.people, size: 16, color: AppColors.textSecondary),
                  Text(
                    ' ${mentor.totalSessions} sessions completed',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () => _bookMentorship(mentor),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    ),
                    child: Text('Book Session'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMentorDetails(Mentor mentor) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) {
          return Container(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          mentor.name.split(' ').map((n) => n[0]).join(''),
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
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
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${mentor.degree} in ${mentor.field}',
                              style: TextStyle(
                                fontSize: 16,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            Text(
                              mentor.university,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'About',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    mentor.bio,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Expertise',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: mentor.expertise.map((skill) => Chip(
                      label: Text(skill),
                      backgroundColor: AppColors.primary.withOpacity(0.1),
                    )).toList(),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text(
                            '${mentor.rating}',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          Text('Rating'),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            '${mentor.totalSessions}',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          Text('Sessions'),
                        ],
                      ),
                      Column(
                        children: [
                          Text(
                            '${mentor.languages.length}',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          Text('Languages'),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _bookMentorship(mentor);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.all(16),
                      ),
                      child: Text(
                        'Book Session - \$${mentor.serviceRates['mentorship']?.toInt()}/hr',
                        style: TextStyle(fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _bookMentorship(Mentor mentor) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.schedule, color: AppColors.primary, size: 48),
        title: Text('Book Mentorship Session'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('You\'re booking a session with ${mentor.name}'),
            const SizedBox(height: 16),
            Text('Rate: \$${mentor.serviceRates['mentorship']?.toInt()}/hour'),
            const SizedBox(height: 16),
            Text('This will redirect you to the booking calendar.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Redirecting to booking system...')),
              );
            },
            child: Text('Continue'),
          ),
        ],
      ),
    );
  }
}
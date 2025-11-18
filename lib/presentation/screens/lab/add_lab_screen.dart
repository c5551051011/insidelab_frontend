// lib/presentation/screens/lab/add_lab_screen.dart
import 'package:flutter/material.dart';
import '../../../data/models/university.dart';
import '../../../data/models/professor.dart';
import '../../../services/university_service.dart';
import '../../../services/professor_service.dart';
import '../../../services/lab_service.dart';
import '../../../core/constants/app_colors.dart';
import '../../../utils/helpers.dart';

class AddLabScreen extends StatefulWidget {
  const AddLabScreen({Key? key}) : super(key: key);

  @override
  State<AddLabScreen> createState() => _AddLabScreenState();
}

class _AddLabScreenState extends State<AddLabScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _departmentController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _websiteController = TextEditingController();

  List<University> _universities = [];
  List<Professor> _professors = [];
  List<Professor> _filteredProfessors = [];

  University? _selectedUniversity;
  Professor? _selectedProfessor;
  List<String> _selectedResearchAreas = [];
  List<String> _selectedTags = [];

  bool _isLoading = false;
  bool _loadingProfessors = false;
  bool _showAddProfessorDialog = false;

  // Available research areas and tags
  final List<String> _availableResearchAreas = [
    'Machine Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics',
    'AI Theory',
    'Deep Learning',
    'Data Mining',
    'Reinforcement Learning',
    'AI Safety',
    'Human-Computer Interaction',
    'Computational Biology',
    'Data Science',
    'Systems',
    'Security',
    'Graphics',
    'Theory of Computation',
  ];

  final List<String> _availableTags = [
    'AI Research',
    'Data Science',
    'Academic',
    'Well Funded',
    'International Friendly',
    'Industry Connections',
    'Flexible Hours',
    'Remote Work',
    'Small Team',
    'Large Lab',
    'Publication Heavy',
    'Collaborative',
    'Independent Work',
    'Mentorship Focused',
    'Conference Travel',
    'Summer Funding',
    'TA Required',
    'Startup Culture',
  ];

  @override
  void initState() {
    super.initState();
    _loadUniversities();
  }

  Future<void> _loadUniversities() async {
    setState(() => _isLoading = true);
    try {
      _universities = await UniversityService.getAllUniversities();
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(
          context,
          'Error loading universities: $e',
          isError: true,
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadProfessors() async {
    if (_selectedUniversity == null) return;

    setState(() => _loadingProfessors = true);
    try {
      _professors = await ProfessorService.getProfessorsByUniversity(_selectedUniversity!.id);
      _filteredProfessors = _professors;
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(
          context,
          'Error loading professors: $e',
          isError: true,
        );
      }
    } finally {
      setState(() => _loadingProfessors = false);
    }
  }

  Future<void> _addLab() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedUniversity == null) {
      Helpers.showSnackBar(context, 'Please select a university', isError: true);
      return;
    }
    if (_selectedProfessor == null) {
      Helpers.showSnackBar(context, 'Please select a professor', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await LabService.addLab(
        name: _nameController.text.trim(),
        professorId: _selectedProfessor!.id,
        universityId: _selectedUniversity!.id,
        department: _departmentController.text.trim(),
        description: _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        website: _websiteController.text.trim().isNotEmpty
            ? _websiteController.text.trim()
            : null,
        researchAreas: _selectedResearchAreas.isNotEmpty ? _selectedResearchAreas : null,
        tags: _selectedTags.isNotEmpty ? _selectedTags : null,
      );

      if (mounted) {
        Helpers.showSnackBar(context, 'Lab added successfully!');
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(
          context,
          'Error adding lab: $e',
          isError: true,
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Lab'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading && _universities.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildBasicInfoSection(),
                    const SizedBox(height: 24),
                    _buildProfessorSection(),
                    const SizedBox(height: 24),
                    _buildResearchAreasSection(),
                    const SizedBox(height: 24),
                    _buildTagsSection(),
                    const SizedBox(height: 32),
                    _buildSubmitButton(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildBasicInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Basic Information',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Lab Name *',
                hintText: 'e.g., Data Mining Lab',
                prefixIcon: Icon(Icons.science),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter lab name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<University>(
              value: _selectedUniversity,
              decoration: const InputDecoration(
                labelText: 'University *',
                prefixIcon: Icon(Icons.school),
              ),
              items: _universities.map((university) {
                return DropdownMenuItem(
                  value: university,
                  child: Text(university.name),
                );
              }).toList(),
              onChanged: (university) {
                setState(() {
                  _selectedUniversity = university;
                  _selectedProfessor = null;
                  _professors.clear();
                  _filteredProfessors.clear();
                });
                if (university != null) {
                  _loadProfessors();
                }
              },
              validator: (value) {
                if (value == null) {
                  return 'Please select a university';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _departmentController,
              decoration: const InputDecoration(
                labelText: 'Department *',
                hintText: 'e.g., Computer Science',
                prefixIcon: Icon(Icons.domain),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter department';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'Brief description of the lab\'s research focus',
                prefixIcon: Icon(Icons.description),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _websiteController,
              decoration: const InputDecoration(
                labelText: 'Website',
                hintText: 'https://lab.university.edu',
                prefixIcon: Icon(Icons.link),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfessorSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Professor',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                if (_selectedUniversity != null)
                  TextButton.icon(
                    onPressed: () => _showAddProfessorDialog = true,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Professor'),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (_selectedUniversity == null)
              const Text(
                'Please select a university first to choose a professor',
                style: TextStyle(color: Colors.grey),
              )
            else if (_loadingProfessors)
              const Center(child: CircularProgressIndicator())
            else if (_filteredProfessors.isEmpty)
              Column(
                children: [
                  const Text(
                    'No professors found for this university.',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: _showAddProfessorForm,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Professor First'),
                  ),
                ],
              )
            else
              DropdownButtonFormField<Professor>(
                value: _selectedProfessor,
                decoration: const InputDecoration(
                  labelText: 'Professor *',
                  prefixIcon: Icon(Icons.person),
                ),
                items: _filteredProfessors.map((professor) {
                  return DropdownMenuItem(
                    value: professor,
                    child: Text('${professor.name} (${professor.department})'),
                  );
                }).toList(),
                onChanged: (professor) {
                  setState(() {
                    _selectedProfessor = professor;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a professor';
                  }
                  return null;
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildResearchAreasSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Research Areas',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableResearchAreas.map((area) {
                final isSelected = _selectedResearchAreas.contains(area);
                return FilterChip(
                  label: Text(area),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedResearchAreas.add(area);
                      } else {
                        _selectedResearchAreas.remove(area);
                      }
                    });
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTagsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lab Tags',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableTags.map((tag) {
                final isSelected = _selectedTags.contains(tag);
                return FilterChip(
                  label: Text(tag),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedTags.add(tag);
                      } else {
                        _selectedTags.remove(tag);
                      }
                    });
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _addLab,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
        ),
        child: _isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : const Text(
                'Add Lab',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }

  void _showAddProfessorForm() {
    // Show a dialog to add a new professor
    // This would open a separate form for professor creation
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Professor Required'),
        content: const Text(
          'You need to add a professor first before creating a lab. '
          'Would you like to add a professor for this university?'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to add professor screen
              // Navigator.pushNamed(context, '/add-professor');
            },
            child: const Text('Add Professor'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _departmentController.dispose();
    _descriptionController.dispose();
    _websiteController.dispose();
    super.dispose();
  }
}
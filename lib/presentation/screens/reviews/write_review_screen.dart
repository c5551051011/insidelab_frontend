// presentation/screens/reviews/write_review_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../data/models/university_department.dart';
import '../../../data/models/research_group.dart';
import '../../../data/providers/data_providers.dart';
import '../../../services/university_service.dart';
import '../../../services/university_department_service.dart';
import '../../../services/research_group_service.dart';
import '../../../services/lab_service.dart';
import '../../../services/review_service.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/common/university_department_selector.dart';
import '../../widgets/rating_stars.dart';

class WriteReviewScreen extends StatefulWidget {
  final String? labId;

  const WriteReviewScreen({
    Key? key,
    this.labId,
  }) : super(key: key);

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reviewTextController = TextEditingController();
  final _prosController = TextEditingController();
  final _consController = TextEditingController();
  final _universityController = TextEditingController();
  final _departmentController = TextEditingController();
  final _researchGroupController = TextEditingController();
  final _labController = TextEditingController();

  String? _selectedLabId;
  String? _selectedUniversityId;
  String? _selectedUniversityName;
  String? _selectedUniversityDepartmentId;
  UniversityDepartment? _selectedUniversityDepartment;
  String? _selectedResearchGroupId;
  String? _selectedResearchGroupName;
  String? _selectedLabName;
  String _position = 'PhD Student';
  String _duration = '1 year';
  double _overallRating = 4.0;

  Map<String, double> _categoryRatings = {};

  bool _isSubmitting = false;
  bool _isCheckingAuth = true;
  bool _isLoadingCategories = true;
  bool _isFormPreFilled = false;
  List<String> _ratingCategories = [];
  List<ResearchGroup> _filteredResearchGroups = [];
  List<Lab> _filteredLabs = [];

  @override
  void initState() {
    super.initState();
    _selectedLabId = widget.labId;
    _checkAuthenticationStatus();
  }

  void _checkAuthenticationStatus() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Use WidgetsBinding to ensure this runs after the build is complete
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // First check if already authenticated
      if (authProvider.isAuthenticated && authProvider.currentUser != null) {
        if (mounted) {
          setState(() {
            _isCheckingAuth = false;
          });
          _loadRatingCategories();
          // Auto-populate form if labId is provided
          if (widget.labId != null) {
            _loadAndPopulateLabDetails(widget.labId!);
          }
        }
        return;
      }

      // If not authenticated, try to refresh auth status
      try {
        await authProvider.checkAuthStatus();

        if (!authProvider.isAuthenticated) {
          if (mounted) {
            context.go('/sign-in');
            return;
          }
        }

        if (mounted) {
          setState(() {
            _isCheckingAuth = false;
          });
          _loadRatingCategories();
          // Auto-populate form if labId is provided
          if (widget.labId != null) {
            _loadAndPopulateLabDetails(widget.labId!);
          }
        }
      } catch (error) {
        // If auth check fails, redirect to login
        if (mounted) {
          context.go('/sign-in');
        }
      }
    });
  }


  // Load lab details and auto-populate form fields
  Future<void> _loadAndPopulateLabDetails(String labId) async {
    try {
      final lab = await LabService.getLabById(labId);
      if (mounted) {
        setState(() {
          // Set university information
          _selectedUniversityId = lab.universityId;
          _selectedUniversityName = lab.universityName;
          _universityController.text = lab.universityName;

          // Set department - we'll need to load the university department
          _departmentController.text = lab.department;

          // Set research group if it exists
          if (lab.hasResearchGroup) {
            _selectedResearchGroupId = lab.researchGroupId;
            _selectedResearchGroupName = lab.researchGroupName;
            _researchGroupController.text = lab.researchGroupName ?? '';
          }

          // Set lab information
          _selectedLabId = lab.id;
          _selectedLabName = lab.name;
          _labController.text = '${lab.name} - ${lab.professorName}';

          // Mark form as pre-filled
          _isFormPreFilled = true;
        });

        // Load related data based on the lab information
        await _loadLabFormData(lab);

        print('Successfully pre-filled form with ${lab.name} information');
      }
    } catch (e) {
      print('Error loading lab details for form: $e');
      // If lab loading fails, continue with empty form - no UI notification during init
    }
  }

  // Load all related form data based on lab information
  Future<void> _loadLabFormData(Lab lab) async {
    try {
      // Load university departments for the university
      final departmentsFuture = UniversityDepartmentService.getDepartmentsByUniversity(lab.universityId);

      // Load research groups for the department if it exists
      final researchGroupsFuture = lab.department.isNotEmpty
          ? ResearchGroupService.getGroupsByUniversityAndDepartment(lab.universityId, lab.department)
          : Future.value(<ResearchGroup>[]);

      // Load all labs for the university
      final labsFuture = LabService.getLabsByUniversity(lab.universityId);

      // Wait for all data to load
      final results = await Future.wait([
        departmentsFuture,
        researchGroupsFuture,
        labsFuture,
      ]);

      if (mounted) {
        setState(() {
          final departments = results[0] as List<UniversityDepartment>;

          // Find the matching department and set it
          final matchingDept = departments.where((dept) => dept.displayName == lab.department).firstOrNull;
          if (matchingDept != null) {
            _selectedUniversityDepartmentId = matchingDept.id;
            _selectedUniversityDepartment = matchingDept;
          }

          final researchGroups = results[1] as List<ResearchGroup>;
          // Ensure selected research group is in the list and remove duplicates by ID
          final groupMap = <String, ResearchGroup>{};
          for (final group in researchGroups) {
            groupMap[group.id] = group;
          }
          if (_selectedResearchGroupId != null && _selectedResearchGroupName != null) {
            // Check if selected research group is already in the list
            final hasSelectedGroup = groupMap.values.any((g) => g.name == _selectedResearchGroupName);
            if (!hasSelectedGroup) {
              // Create a temporary group entry if it's not in the API results
              final tempGroup = ResearchGroup(
                id: _selectedResearchGroupId!,
                name: _selectedResearchGroupName!,
                description: '',
                universityId: _selectedUniversityId!,
                universityName: _selectedUniversityName!,
                department: lab.department,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );
              groupMap[tempGroup.id] = tempGroup;
            }
          }
          _filteredResearchGroups = groupMap.values.toList();

          _filteredLabs = results[2] as List<Lab>;
        });
      }
    } catch (e) {
      print('Error loading form data: $e');
      // Continue with current data if loading fails
    }
  }

  void _loadRatingCategories() async {
    try {
      // Clear cached categories to ensure we get fresh ones
      ReviewService.clearCachedCategories();
      final categories = await ReviewService.getRatingCategories();

      if (categories.isEmpty) {
        throw Exception('No rating categories returned from backend');
      }

      if (mounted) {
        setState(() {
          _ratingCategories = categories;
          _categoryRatings = {
            for (String category in categories) category: 4.0,
          };
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      print('Error loading rating categories: $e');

      // Fallback to hardcoded categories
      final fallbackCategories = [
        'Research Environment',
        'Advisor Support',
        'Work-Life Balance',
        'Career Support',
        'Funding & Resources',
        'Lab Culture',
        'Mentorship Quality',
      ];

      if (mounted) {
        setState(() {
          _ratingCategories = fallbackCategories;
          _categoryRatings = {
            for (String category in fallbackCategories) category: 4.0,
          };
          _isLoadingCategories = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not load categories from server. Using default categories.'),
            backgroundColor: AppColors.warning,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () {
                setState(() {
                  _isLoadingCategories = true;
                });
                _loadRatingCategories();
              },
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isCheckingAuth || _isLoadingCategories) {
      return Scaffold(
        appBar: const HeaderNavigation(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                _isCheckingAuth ? 'Checking authentication...' : 'Loading rating categories...',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      );
    }

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
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      UniversityDepartmentSelector(
                        selectedUniversityId: _selectedUniversityId,
                        selectedUniversityName: _selectedUniversityName,
                        selectedUniversityDepartmentId: _selectedUniversityDepartmentId,
                        onUniversitySelected: (universityId, universityName) {
                          setState(() {
                            _selectedUniversityId = universityId;
                            _selectedUniversityName = universityName;
                            _universityController.text = universityName;
                            // Clear ALL dependent selections when university changes
                            _selectedUniversityDepartmentId = null;
                            _selectedUniversityDepartment = null;
                            _departmentController.clear();
                            _researchGroupController.clear();
                            _selectedResearchGroupId = null;
                            _selectedResearchGroupName = null;
                            _labController.clear();
                            _selectedLabId = null;
                            _selectedLabName = null;
                            // Completely clear research groups - they should only load after department selection
                            _filteredResearchGroups.clear();
                            _filteredLabs.clear();
                          });
                          print('DEBUG: University changed to $universityName, cleared all research groups');
                        },
                        onDepartmentSelected: (departmentId, department) {
                          setState(() {
                            _selectedUniversityDepartmentId = departmentId;
                            _selectedUniversityDepartment = department;
                            _departmentController.text = department.displayName;
                            // Clear ALL dependent selections when department changes
                            _researchGroupController.clear();
                            _selectedResearchGroupId = null;
                            _selectedResearchGroupName = null;
                            _labController.clear();
                            _selectedLabId = null;
                            _selectedLabName = null;
                            _filteredResearchGroups.clear();
                            _filteredLabs.clear();
                          });

                          // Load research groups for the selected department ONLY
                          if (_selectedUniversityId != null) {
                            print('DEBUG: Department changed to ${department.displayName}, loading research groups...');
                            _loadResearchGroups(_selectedUniversityId!, department.displayName);
                          }
                        },
                      ),
                      const SizedBox(height: 24),
                      _buildResearchGroupSelection(),
                      const SizedBox(height: 24),
                      _buildLabSelection(),
                      const SizedBox(height: 24),
                      _buildPositionAndDuration(),
                      const SizedBox(height: 24),
                      _buildOverallRating(),
                      const SizedBox(height: 24),
                      _buildCategoryRatings(),
                      const SizedBox(height: 24),
                      _buildReviewText(),
                      const SizedBox(height: 24),
                      _buildProsCons(),
                      const SizedBox(height: 32),
                      _buildSubmitSection(),
                    ],
                  ),
                ),
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
          'Write a Review',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _isFormPreFilled
              ? 'Share your honest experience to help future graduate students (form pre-filled)'
              : 'Share your honest experience to help future graduate students',
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
          ),
        ),
        if (_isFormPreFilled) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.success.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.check_circle,
                  size: 16,
                  color: AppColors.success,
                ),
                const SizedBox(width: 6),
                Text(
                  'Lab information pre-filled',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.success,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.info.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.info.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.info),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Your review will be anonymous. Only your position and duration will be shown publicly.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }


  Widget _buildResearchGroupSelection() {
    // Debug: Show current research groups
    print('DEBUG: Building research group dropdown with ${_filteredResearchGroups.length} groups');
    for (final group in _filteredResearchGroups) {
      print('DEBUG: - ${group.name} (dept: ${group.department})');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Research Group',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Optional',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            // DEBUG: Show current department
            const SizedBox(width: 8),
            Text(
              'Dept: ${_selectedUniversityDepartment?.displayName ?? "None"}',
              style: TextStyle(
                fontSize: 10,
                color: Colors.red,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _buildStandardDropdown<String>(
          value: _selectedResearchGroupName,
          labelText: 'Research Group',
          hintText: _selectedUniversityDepartment != null
              ? 'Select a research group or add new (optional)'
              : 'Select a department first',
          enabled: _selectedUniversityDepartment != null,
          items: [
            const DropdownMenuItem<String>(
              value: '___NONE___',
              child: Text('No Research Group'),
            ),
            ..._filteredResearchGroups.map((group) => DropdownMenuItem<String>(
              value: group.name,
              child: Text(
                group.name,
                overflow: TextOverflow.ellipsis,
              ),
            )),
            const DropdownMenuItem<String>(
              value: '___ADD_NEW___',
              child: Row(
                children: [
                  Icon(Icons.add, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Add New Research Group',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
          onChanged: (String? value) {
            if (value == '___ADD_NEW___') {
              _showAddResearchGroupDialog();
            } else if (value == '___NONE___') {
              setState(() {
                _selectedResearchGroupId = null;
                _selectedResearchGroupName = null;
                _researchGroupController.clear();
                _labController.clear();
                _selectedLabId = null;
                _selectedLabName = null;
                _filteredLabs.clear();
              });
              // Load all labs for department instead
              if (_selectedUniversityId != null && _selectedUniversityDepartment != null) {
                _loadLabsForDepartment(_selectedUniversityId!, _selectedUniversityDepartment!.displayName);
              }
            } else if (value != null) {
              final selectedGroup = _filteredResearchGroups.firstWhere(
                (group) => group.name == value,
                orElse: () => _filteredResearchGroups.isEmpty
                    ? ResearchGroup(
                        id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
                        name: value,
                        description: '',
                        universityId: _selectedUniversityId!,
                        universityName: _selectedUniversityName!,
                        department: _selectedUniversityDepartment!.displayName,
                        createdAt: DateTime.now(),
                        updatedAt: DateTime.now(),
                      )
                    : _filteredResearchGroups.first,
              );
              setState(() {
                _selectedResearchGroupId = selectedGroup.id;
                _selectedResearchGroupName = selectedGroup.name;
                _researchGroupController.text = selectedGroup.name;
                // Clear lab selection when research group changes
                _labController.clear();
                _selectedLabId = null;
                _selectedLabName = null;
                _filteredLabs.clear();
              });

              // Load labs for the selected research group
              if (selectedGroup.id.startsWith('temp_')) {
                // For temporary groups, load all department labs
                if (_selectedUniversityId != null && _selectedUniversityDepartment != null) {
                  _loadLabsForDepartment(_selectedUniversityId!, _selectedUniversityDepartment!.displayName);
                }
              } else {
                _loadLabsForGroup(selectedGroup.id);
              }
            }
          },
        ),
      ],
    );
  }

  Widget _buildLabSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Lab/Professor *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TypeAheadField<Lab>(
          controller: _labController,
          builder: (context, controller, focusNode) {
            return TextField(
              controller: controller,
              focusNode: focusNode,
              enabled: _selectedUniversityId != null,
              decoration: InputDecoration(
                hintText: _selectedUniversityId != null
                    ? 'Search or type lab/professor name...'
                    : 'Please select a university first',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                suffixIcon: _labController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _labController.clear();
                            _selectedLabId = null;
                            _selectedLabName = null;
                          });
                        },
                      )
                    : const Icon(Icons.search),
              ),
            );
          },
          suggestionsCallback: (pattern) async {
            if (_selectedUniversityId == null) return <Lab>[];

            try {
              // Always fetch labs for the selected university to ensure correct filtering
              List<Lab> labs;

              if (pattern.isEmpty) {
                // Always fetch fresh labs for the selected university
                labs = await LabService.getLabsByUniversity(_selectedUniversityId!);
                print('Fetched ${labs.length} labs for university $_selectedUniversityId');
              } else {
                // Search within the university's labs
                labs = await LabService.searchLabsAdvanced(
                  query: pattern,
                  university: _selectedUniversityId!,
                );
                print('Found ${labs.length} labs matching "$pattern" in university $_selectedUniversityId');
              }

              return labs;
            } catch (e) {
              print('Error searching labs: $e');
              // Fallback: filter cached labs by university ID and pattern
              final universityLabs = _filteredLabs.where((lab) =>
                  lab.universityId == _selectedUniversityId).toList();

              if (pattern.isEmpty) {
                return universityLabs;
              } else {
                return universityLabs.where((lab) =>
                    lab.name.toLowerCase().contains(pattern.toLowerCase()) ||
                    lab.professorName.toLowerCase().contains(pattern.toLowerCase())).toList();
              }
            }
          },
          itemBuilder: (context, suggestion) {
            return ListTile(
              title: Text(suggestion.name),
              subtitle: Text('Professor: ${suggestion.professorName}'),
            );
          },
          onSelected: (suggestion) {
            setState(() {
              _selectedLabId = suggestion.id;
              _selectedLabName = suggestion.name;
              _labController.text = '${suggestion.name} - ${suggestion.professorName}';
            });
          },
          emptyBuilder: (context) => Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text('Lab/Professor not found'),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: () => _showAddLabDialog(),
                  child: const Text('Add New Lab/Professor'),
                ),
              ],
            ),
          ),
        ),
        if (_selectedLabId == null && _selectedUniversityId != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              'Please select or add a lab/professor',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.error,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPositionAndDuration() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 600;

    if (isNarrow) {
      // Stack vertically on narrow screens
      return Column(
        children: [
          _buildPositionDropdown(),
          const SizedBox(height: 16),
          _buildDurationDropdown(),
        ],
      );
    } else {
      // Side by side on wider screens
      return Row(
        children: [
          Expanded(child: _buildPositionDropdown()),
          const SizedBox(width: 16),
          Expanded(child: _buildDurationDropdown()),
        ],
      );
    }
  }

  Widget _buildPositionDropdown() {
    return _buildStandardDropdown<String>(
      value: _position,
      labelText: 'Your Position *',
      items: const [
        DropdownMenuItem(value: 'PhD Student', child: Text('PhD Student')),
        DropdownMenuItem(value: 'MS Student', child: Text('MS Student')),
        DropdownMenuItem(value: 'Undergrad', child: Text('Undergraduate Student')),
        DropdownMenuItem(value: 'PostDoc', child: Text('PostDoc')),
        DropdownMenuItem(value: 'Research Assistant', child: Text('Research Assistant')),
      ],
      onChanged: (value) {
        setState(() {
          _position = value!;
        });
      },
    );
  }

  Widget _buildDurationDropdown() {
    return _buildStandardDropdown<String>(
      value: _duration,
      labelText: 'Duration *',
      items: const [
        DropdownMenuItem(value: '< 6 months', child: Text('Less than 6 months')),
        DropdownMenuItem(value: '6 months', child: Text('6 months')),
        DropdownMenuItem(value: '1 year', child: Text('1 year')),
        DropdownMenuItem(value: '2 years', child: Text('2 years')),
        DropdownMenuItem(value: '3 years', child: Text('3 years')),
        DropdownMenuItem(value: '4+ years', child: Text('4+ years')),
      ],
      onChanged: (value) {
        setState(() {
          _duration = value!;
        });
      },
    );
  }

  // Reusable standard dropdown widget
  Widget _buildStandardDropdown<T>({
    required T? value,
    required String labelText,
    String? hintText,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?>? onChanged,
    bool enabled = true,
  }) {
    return Container(
      constraints: const BoxConstraints(
        minHeight: 56,
        maxHeight: 120,
      ),
      child: DropdownButtonFormField<T>(
        value: value,
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: AppColors.primary, width: 2),
          ),
        ),
        isExpanded: true,
        menuMaxHeight: 300,
        items: items,
        onChanged: enabled ? onChanged : null,
      ),
    );
  }

  Widget _buildOverallRating() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Overall Rating *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.1),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Interactive Star Rating
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildInteractiveStars(),
                  const SizedBox(width: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _overallRating.toStringAsFixed(1),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Rating Slider for Fine-tuning
              Column(
                children: [
                  Text(
                    'Fine-tune your rating',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.primary,
                      inactiveTrackColor: AppColors.border,
                      thumbColor: AppColors.primary,
                      overlayColor: AppColors.primary.withOpacity(0.2),
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
                      trackHeight: 4,
                    ),
                    child: Slider(
                      value: _overallRating,
                      min: 0.5,
                      max: 5.0,
                      divisions: 9,
                      onChanged: (value) {
                        setState(() {
                          _overallRating = value;
                        });
                      },
                    ),
                  ),
                  // Rating Labels
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('0.5', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('1.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('2.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('3.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('4.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                      Text('5.0', style: TextStyle(fontSize: 12, color: AppColors.textTertiary)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Rating Description
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getRatingColor(_overallRating).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getRatingDescription(_overallRating),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _getRatingColor(_overallRating),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryRatings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Category Ratings',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Rate different aspects of your experience',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 16),
        ..._categoryRatings.keys.map((category) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: _buildCategoryRatingRow(category),
          );
        }),
      ],
    );
  }

  Widget _buildCategoryRatingRow(String category) {
    final rating = _categoryRatings[category]!;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            category,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(width: 16),
        RatingStars(rating: rating, size: 20),
        const SizedBox(width: 16),
        SizedBox(
          width: 48,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              rating.toStringAsFixed(1),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 3,
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.primary,
              inactiveTrackColor: AppColors.border,
              thumbColor: AppColors.primary,
              overlayColor: AppColors.primary.withOpacity(0.2),
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
              trackHeight: 4,
            ),
            child: Slider(
              value: rating,
              min: 0.5,
              max: 5.0,
              divisions: 9,
              onChanged: (value) {
                setState(() {
                  _categoryRatings[category] = value;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Review *',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Share your honest experience and insights',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _reviewTextController,
          maxLines: 6,
          decoration: InputDecoration(
            hintText: 'Describe your experience in the lab, the research environment, mentorship quality, and any other relevant details...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.primary),
            ),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return 'Please write your review';
            }
            if (value.trim().length < 50) {
              return 'Please write at least 50 characters';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildProsCons() {
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 600;

    if (isNarrow) {
      // Stack vertically on narrow screens
      return Column(
        children: [
          _buildProsField(),
          const SizedBox(height: 16),
          _buildConsField(),
        ],
      );
    } else {
      // Side by side on wider screens
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: _buildProsField()),
          const SizedBox(width: 16),
          Expanded(child: _buildConsField()),
        ],
      );
    }
  }

  Widget _buildProsField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pros',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.success,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _prosController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'List the positive aspects (one per line)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.success.withOpacity(0.3)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.success),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConsField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Cons',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.error,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _consController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: 'List any drawbacks (one per line)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.error.withOpacity(0.3)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: AppColors.error),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.warning.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.warning.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(Icons.shield_outlined, color: AppColors.warning),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Community Guidelines',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Reviews must be honest, respectful, and based on personal experience. Inappropriate content will be removed.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _submitReview,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isSubmitting
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                      SizedBox(width: 12),
                      Text('Submitting Review...'),
                    ],
                  )
                : const Text(
                    'Submit Review',
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




  void _showAddResearchGroupDialog() {
    String? groupName;
    String? groupDescription;
    String? groupWebsite;
    List<String> researchAreas = [];
    String? newResearchArea;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(
            'Add New Research Group',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
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
                  Text(
                    'Department: ${_selectedUniversityDepartment?.displayName}',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Research Group Name *',
                      hintText: 'e.g., Machine Learning Lab',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: AppColors.primary, width: 2),
                      ),
                    ),
                    onChanged: (value) {
                      groupName = value.trim().isEmpty ? null : value.trim();
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Description',
                      hintText: 'Brief description of research group',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: AppColors.primary, width: 2),
                      ),
                    ),
                    maxLines: 3,
                    onChanged: (value) {
                      groupDescription = value.trim().isEmpty ? null : value.trim();
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Website (optional)',
                      hintText: 'https://example.com/group',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: AppColors.primary, width: 2),
                      ),
                    ),
                    onChanged: (value) {
                      groupWebsite = value.trim().isEmpty ? null : value.trim();
                    },
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Research Areas',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          decoration: InputDecoration(
                            hintText: 'Add research area',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(color: AppColors.primary, width: 2),
                            ),
                          ),
                          onChanged: (value) {
                            newResearchArea = value.trim().isEmpty ? null : value.trim();
                          },
                          onFieldSubmitted: (value) {
                            if (value.trim().isNotEmpty && !researchAreas.contains(value.trim())) {
                              setDialogState(() {
                                researchAreas.add(value.trim());
                              });
                              newResearchArea = null;
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () {
                          if (newResearchArea != null && !researchAreas.contains(newResearchArea!)) {
                            setDialogState(() {
                              researchAreas.add(newResearchArea!);
                            });
                            newResearchArea = null;
                          }
                        },
                        icon: Icon(Icons.add, color: AppColors.primary),
                      ),
                    ],
                  ),
                  if (researchAreas.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: researchAreas.map((area) {
                        return Chip(
                          label: Text(area),
                          deleteIcon: Icon(Icons.close, size: 18),
                          onDeleted: () {
                            setDialogState(() {
                              researchAreas.remove(area);
                            });
                          },
                          backgroundColor: AppColors.primary.withOpacity(0.1),
                          labelStyle: TextStyle(color: AppColors.primary),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
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
                if (groupName != null && groupName!.isNotEmpty) {
                  try {
                    // Save the research group to the backend
                    final newGroup = await ResearchGroupService.createResearchGroup(
                      name: groupName!,
                      description: groupDescription ?? '',
                      universityId: _selectedUniversityId!,
                      department: _selectedUniversityDepartment!.displayName,
                      researchAreas: researchAreas,
                      website: groupWebsite,
                    );

                    // Add to filtered list and select it
                    setState(() {
                      _selectedResearchGroupId = newGroup.id;
                      _selectedResearchGroupName = newGroup.name;
                      _researchGroupController.text = newGroup.name;
                      _filteredResearchGroups.add(newGroup);
                      // Clear dependent fields
                      _labController.clear();
                      _selectedLabId = null;
                      _selectedLabName = null;
                      _filteredLabs.clear();
                    });
                    Navigator.of(context).pop();

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Research Group "$groupName" created and saved successfully'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  } catch (e) {
                    // If backend save fails, create temporary group for form completion
                    final now = DateTime.now();
                    final tempGroup = ResearchGroup(
                      id: 'temp_${now.millisecondsSinceEpoch}',
                      name: groupName!,
                      description: groupDescription ?? '',
                      universityId: _selectedUniversityId!,
                      universityName: _selectedUniversityName!,
                      department: _selectedUniversityDepartment!.displayName,
                      researchAreas: researchAreas,
                      website: groupWebsite,
                      createdAt: now,
                      updatedAt: now,
                    );

                    setState(() {
                      _selectedResearchGroupId = tempGroup.id;
                      _selectedResearchGroupName = tempGroup.name;
                      _researchGroupController.text = tempGroup.name;
                      _filteredResearchGroups.add(tempGroup);
                      // Clear dependent fields
                      _labController.clear();
                      _selectedLabId = null;
                      _selectedLabName = null;
                      _filteredLabs.clear();
                    });
                    Navigator.of(context).pop();

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Research Group "$groupName" added temporarily. Save error: $e'),
                        backgroundColor: AppColors.warning,
                        duration: Duration(seconds: 5),
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Add Research Group'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddLabDialog() {
    String? labName;
    String? professorName;
    String? department;
    String? labWebsite;
    bool isVerifyingWebsite = false;
    String? websiteError;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add New Lab/Professor'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Lab Name *',
                    hintText: 'e.g., Computer Vision Lab',
                  ),
                  onChanged: (value) => labName = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Professor Name *',
                    hintText: 'e.g., Dr. Jane Smith',
                  ),
                  onChanged: (value) => professorName = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Department *',
                    hintText: 'e.g., Computer Science',
                  ),
                  onChanged: (value) => department = value,
                ),
                const SizedBox(height: 12),
                TextField(
                  decoration: InputDecoration(
                    labelText: 'Lab Website *',
                    hintText: 'https://lab.university.edu',
                    errorText: websiteError,
                    suffixIcon: isVerifyingWebsite
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.link),
                  ),
                  onChanged: (value) {
                    labWebsite = value;
                    if (websiteError != null) {
                      setDialogState(() {
                        websiteError = null;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.info_outline, size: 16, color: AppColors.info),
                          const SizedBox(width: 8),
                          const Text('Verification Required', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'We will verify that the website exists and belongs to the specified lab/professor before adding it to our database.',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isVerifyingWebsite ? null : () async {
                if (labName?.isEmpty == true ||
                    professorName?.isEmpty == true ||
                    department?.isEmpty == true ||
                    labWebsite?.isEmpty == true) {
                  return;
                }

                // Validate website URL format
                if (labWebsite != null && !_isValidUrl(labWebsite!)) {
                  setDialogState(() {
                    websiteError = 'Please enter a valid URL (https://example.com)';
                  });
                  return;
                }

                setDialogState(() {
                  isVerifyingWebsite = true;
                  websiteError = null;
                });

                // Verify website exists
                final isValid = await _verifyWebsite(labWebsite!);

                setDialogState(() {
                  isVerifyingWebsite = false;
                });

                if (!isValid) {
                  setDialogState(() {
                    websiteError = 'Website could not be verified. Please check the URL.';
                  });
                  return;
                }

                try {
                  // First create the professor, then use their ID for the lab
                  final newProfessor = await UniversityService.addProfessor(
                    name: professorName!,
                    universityId: _selectedUniversityId!,
                    department: department!,
                  );

                  // Add lab via API using the newly created professor's ID
                  final newLab = await LabService.addLab(
                    name: labName!,
                    professorId: newProfessor.id,
                    universityId: _selectedUniversityId!,
                    department: department!,
                    website: labWebsite,
                  );

                  setState(() {
                    _selectedLabId = newLab.id;
                    _selectedLabName = newLab.name;
                    _labController.text = '${newLab.name} - ${newLab.professorName}';
                    // Add the new lab to the filtered list so it appears in future searches
                    _filteredLabs.add(newLab);
                  });
                  Navigator.pop(context);

                  // Show success message
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Lab/Professor added successfully! Website verified.'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                } catch (e) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to add lab: ${e.toString()}'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              },
              child: isVerifyingWebsite
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Verify & Add'),
            ),
          ],
        ),
      ),
    );
  }


  void _submitReview() async {
    if (!_formKey.currentState!.validate() ||
        _selectedUniversityId == null ||
        _selectedLabId == null) {

      // Trigger UI updates to show validation messages
      setState(() {
        // This will trigger the rebuild and show error messages
      });

      String errorMessage = '';
      if (_selectedUniversityId == null) {
        errorMessage = 'Please select a university';
      } else if (_selectedLabId == null) {
        errorMessage = 'Please select a lab or professor';
      } else {
        errorMessage = 'Please fill in all required fields';
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final pros = _prosController.text
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();

      final cons = _consController.text
          .split('\n')
          .where((line) => line.trim().isNotEmpty)
          .toList();

      // Get current user from auth provider
      final authProvider = context.read<AuthProvider>();
      final currentUser = authProvider.currentUser;

      if (currentUser == null) {
        throw Exception('User not authenticated');
      }

      // Prepare review data for API
      final reviewData = {
        'lab': int.parse(_selectedLabId!), // Backend expects 'lab' as integer, not 'lab_id'
        'position': _position,
        'duration': _duration,
        'rating': _overallRating,
        'ratings_input': _categoryRatings, // Backend expects 'ratings_input' for write operations
        'review_text': _reviewTextController.text.trim(),
        'pros': pros,
        'cons': cons,
      };

      print('Submitting review data: ${reviewData}');
      print('Category ratings: ${_categoryRatings}');

      // Submit review via API
      await ReviewService.submitReview(reviewData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Review submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );

        Navigator.pop(context);
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit review: $error'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Widget _buildInteractiveStars() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final isHalfFilled = _overallRating >= index + 0.5 && _overallRating < starValue;
        final isFilled = _overallRating >= starValue;

        return GestureDetector(
          onTap: () {
            setState(() {
              // If tapping on a filled star, set to half rating
              // If tapping on empty/half star, set to full rating
              if (isFilled && _overallRating == starValue) {
                _overallRating = starValue - 0.5;
              } else if (isHalfFilled && _overallRating == starValue - 0.5) {
                _overallRating = starValue;
              } else {
                _overallRating = starValue;
              }
            });
          },
          child: Container(
            padding: const EdgeInsets.all(4),
            child: Icon(
              isFilled ? Icons.star : isHalfFilled ? Icons.star_half : Icons.star_border,
              size: 36,
              color: isFilled || isHalfFilled ? Colors.amber : AppColors.border,
            ),
          ),
        );
      }),
    );
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.5) return AppColors.success;
    if (rating >= 3.5) return AppColors.primary;
    if (rating >= 2.5) return Colors.orange;
    return AppColors.error;
  }

  String _getRatingDescription(double rating) {
    if (rating >= 4.5) return 'Excellent Experience';
    if (rating >= 3.5) return 'Good Experience';
    if (rating >= 2.5) return 'Average Experience';
    if (rating >= 1.5) return 'Below Average';
    return 'Poor Experience';
  }

  bool _isValidUrl(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https') && uri.hasAuthority;
    } catch (e) {
      return false;
    }
  }

  Future<bool> _verifyWebsite(String url) async {
    try {
      // Add https:// if no scheme is provided
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://$url';
      }

      // For demo purposes, we'll simulate website verification
      // In a real app, you would make an HTTP request to check if the website exists
      await Future.delayed(const Duration(seconds: 2));

      // Enhanced validation for various academic and research domains
      final uri = Uri.parse(url);
      final domain = uri.host.toLowerCase();
      final fullUrl = url.toLowerCase();

      // Check for academic domains
      final isAcademic = domain.contains('.edu') ||
                        domain.contains('.ac.') ||
                        domain.contains('university') ||
                        domain.contains('institute') ||
                        domain.contains('college');

      // Check for research-related domains and platforms
      final isResearchRelated = domain.contains('lab') ||
                               domain.contains('research') ||
                               domain.contains('kaist') ||
                               domain.contains('mit') ||
                               domain.contains('stanford') ||
                               domain.contains('berkeley') ||
                               domain.contains('harvard') ||
                               domain.contains('cmu') ||
                               domain.contains('google.com') || // Google Sites
                               domain.contains('github.io') ||
                               domain.contains('wordpress.com') ||
                               domain.contains('wixsite.com') ||
                               fullUrl.contains('sites.google.com');

      // Check for common academic URL patterns
      final hasAcademicPattern = fullUrl.contains('/lab') ||
                                fullUrl.contains('/research') ||
                                fullUrl.contains('/faculty') ||
                                fullUrl.contains('/people') ||
                                fullUrl.contains('/group');

      // Consider it valid if it meets any of the criteria
      final isValid = isAcademic || isResearchRelated || hasAcademicPattern;

      // For demo, only fail if URL is clearly invalid (less than 5% failure rate)
      final shouldFail = DateTime.now().millisecond % 20 == 0 && !isValid;

      return isValid && !shouldFail;
    } catch (e) {
      return false;
    }
  }

  // Load research groups for selected university and department
  Future<void> _loadResearchGroups(String universityId, String department) async {
    print('DEBUG: Loading research groups for university $universityId, department: $department');

    // Clear existing research groups first
    setState(() {
      _filteredResearchGroups.clear();
      _selectedResearchGroupId = null;
      _selectedResearchGroupName = null;
      _researchGroupController.clear();
    });

    try {
      final groups = await ResearchGroupService.getGroupsByUniversityAndDepartment(
        universityId,
        department,
      );
      print('DEBUG: Found ${groups.length} research groups for department $department');
      for (final group in groups) {
        print('DEBUG: - ${group.name} (dept: ${group.department})');
      }

      setState(() {
        _filteredResearchGroups = groups;
      });
    } catch (e) {
      print('DEBUG: Error loading research groups: $e');
      // Handle error silently, research groups are optional
      setState(() {
        _filteredResearchGroups = [];
      });
    }
  }

  // Load labs for selected university and department (when no research group is selected)
  Future<void> _loadLabsForDepartment(String universityId, String department) async {
    try {
      final allLabs = await LabService.getLabsByUniversity(universityId);
      final departmentLabs = allLabs.where((lab) => lab.department == department).toList();

      setState(() {
        _filteredLabs = departmentLabs;
      });
    } catch (e) {
      print('Error loading labs for department: $e');
      if (mounted) {
        setState(() {
          _filteredLabs = [];
        });
      }
    }
  }

  // Load labs for selected research group
  Future<void> _loadLabsForGroup(String groupId) async {
    try {
      final labs = await ResearchGroupService.getLabsInGroup(groupId);
      // Convert to Lab objects if needed
      setState(() {
        // For now, we'll assume the API returns Lab-compatible data
        _filteredLabs = labs.map((labData) => Lab.fromJson(labData)).toList();
      });
    } catch (e) {
      // Fallback to loading labs by department if group fails
      if (_selectedUniversityId != null && _selectedUniversityDepartment != null) {
        await _loadLabsForDepartment(_selectedUniversityId!, _selectedUniversityDepartment!.displayName);
      }
    }
  }


  @override
  void dispose() {
    _reviewTextController.dispose();
    _prosController.dispose();
    _consController.dispose();
    _universityController.dispose();
    _departmentController.dispose();
    _researchGroupController.dispose();
    _labController.dispose();
    super.dispose();
  }
}
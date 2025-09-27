// lib/presentation/widgets/common/university_department_selector.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/university.dart';
import '../../../data/models/university_department.dart';
import '../../../services/university_service.dart';
import '../../../services/university_department_service.dart';

class UniversityDepartmentSelector extends StatefulWidget {
  final String? selectedUniversityId;
  final String? selectedUniversityName;
  final String? selectedUniversityDepartmentId;
  final Function(String universityId, String universityName) onUniversitySelected;
  final Function(String universityDepartmentId, UniversityDepartment department) onDepartmentSelected;
  final bool isRequired;
  final String? Function(String?)? universityValidator;
  final String? Function(String?)? departmentValidator;

  const UniversityDepartmentSelector({
    Key? key,
    this.selectedUniversityId,
    this.selectedUniversityName,
    this.selectedUniversityDepartmentId,
    required this.onUniversitySelected,
    required this.onDepartmentSelected,
    this.isRequired = true,
    this.universityValidator,
    this.departmentValidator,
  }) : super(key: key);

  @override
  State<UniversityDepartmentSelector> createState() => _UniversityDepartmentSelectorState();
}

class _UniversityDepartmentSelectorState extends State<UniversityDepartmentSelector> {
  List<University> _universities = [];
  List<UniversityDepartment> _universityDepartments = [];
  bool _isLoadingDepartments = false;
  bool _isLoadingUniversities = false;

  @override
  void initState() {
    super.initState();
    _loadUniversities();
  }

  Future<void> _loadUniversities() async {
    try {
      final universities = await UniversityService.searchUniversities('');
      if (mounted) {
        setState(() {
          // Remove duplicates by ID to prevent dropdown errors
          final uniqueUniversities = <String, University>{};
          for (final uni in universities) {
            uniqueUniversities[uni.id] = uni;
          }
          _universities = uniqueUniversities.values.toList();
        });
        // If there's a selected university, load its departments
        if (widget.selectedUniversityId != null) {
          _loadDepartmentsForUniversity(widget.selectedUniversityId!);
        }
      }
    } catch (e) {
      print('Error loading universities: $e');
    }
  }

  Future<void> _loadDepartmentsForUniversity(String universityId) async {
    setState(() {
      _isLoadingDepartments = true;
      _universityDepartments.clear();
    });

    try {
      final departments = await UniversityDepartmentService.getDepartmentsByUniversity(universityId);
      if (mounted) {
        setState(() {
          // Remove duplicates by ID to prevent dropdown errors
          final uniqueDepartments = <String, UniversityDepartment>{};
          for (final dept in departments) {
            uniqueDepartments[dept.id] = dept;
          }
          _universityDepartments = uniqueDepartments.values.toList();
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

                  await _loadUniversities();

                  setState(() {
                    _isLoadingUniversities = false;
                  });

                  widget.onUniversitySelected(newUniversity.id, newUniversity.name);
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
              'University: ${widget.selectedUniversityName}',
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

                  setState(() {
                    _isLoadingDepartments = true;
                  });

                  final newUniversityDepartment = await UniversityDepartmentService.createNewDepartmentForUniversity(
                    universityId: widget.selectedUniversityId!,
                    departmentName: departmentName!,
                    localName: localName,
                  );

                  await _loadDepartmentsForUniversity(widget.selectedUniversityId!);

                  widget.onDepartmentSelected(newUniversityDepartment.id, newUniversityDepartment);

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
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // University Selection
        Container(
          constraints: const BoxConstraints(
            minHeight: 56,
            maxHeight: 120,
          ),
          child: DropdownButtonFormField<String>(
            value: widget.selectedUniversityId != null &&
                   _universities.any((uni) => uni.id == widget.selectedUniversityId)
                ? widget.selectedUniversityId
                : null,
            decoration: InputDecoration(
              labelText: widget.isRequired ? 'University *' : 'University',
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
                widget.onUniversitySelected(universityId, university.name);
                _loadDepartmentsForUniversity(universityId);
              }
            },
            validator: widget.universityValidator ?? (widget.isRequired ? (value) {
              if (value == null || value.isEmpty) {
                return 'Please select your university';
              }
              return null;
            } : null),
          ),
        ),
        const SizedBox(height: 20),
        // Department Selection
        Container(
          constraints: const BoxConstraints(
            minHeight: 56,
            maxHeight: 120,
          ),
          child: DropdownButtonFormField<String>(
            value: widget.selectedUniversityDepartmentId != null &&
                   _universityDepartments.any((dept) => dept.id == widget.selectedUniversityDepartmentId)
                ? widget.selectedUniversityDepartmentId
                : null,
            decoration: InputDecoration(
              labelText: widget.isRequired ? 'Department *' : 'Department',
              prefixIcon: const Icon(Icons.science),
              helperText: widget.selectedUniversityId != null
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
              if (widget.selectedUniversityId != null)
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
            onChanged: widget.selectedUniversityId == null ? null : (String? value) {
              if (value == '___ADD_NEW___') {
                _showAddDepartmentDialog();
              } else if (value != null) {
                final department = _universityDepartments.firstWhere((d) => d.id == value);
                widget.onDepartmentSelected(value, department);
              }
            },
            validator: widget.departmentValidator ?? (widget.isRequired ? (value) {
              if (value == null || value.isEmpty) {
                return 'Please select your department';
              }
              return null;
            } : null),
          ),
        ),
      ],
    );
  }
}
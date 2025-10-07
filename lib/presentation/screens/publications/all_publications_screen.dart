// presentation/screens/publications/all_publications_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/lab.dart';
import '../../../data/models/publication.dart' as pub;
import '../../../services/publication_service.dart';
import '../../widgets/common/header_navigation.dart';
import 'package:url_launcher/url_launcher.dart';

class AllPublicationsScreen extends StatefulWidget {
  final Lab lab;

  const AllPublicationsScreen({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  State<AllPublicationsScreen> createState() => _AllPublicationsScreenState();
}

class _AllPublicationsScreenState extends State<AllPublicationsScreen> {
  // State variables
  List<pub.Publication> publications = [];
  pub.PublicationStats? stats;
  Map<String, dynamic>? researchAreas;
  Map<String, int>? yearlyStats;

  // Filters
  String selectedVenue = 'All Venues';
  String selectedYear = 'All Years';
  String selectedArea = 'All Areas';
  String selectedSort = 'Sort: Most Cited';
  String searchQuery = '';
  Set<String> activeFilters = {};

  // Pagination
  int currentPage = 1;
  int totalPages = 1;
  int itemsPerPage = 10;

  // Loading states
  bool isLoading = true;
  bool isLoadingPublications = false;

  // Available filter options
  List<String> venueOptions = ['All Venues', 'Top-tier Only', 'Conferences', 'Journals', 'Workshops'];
  List<String> yearOptions = ['All Years', '2024', '2023', '2022', 'Last 5 years'];
  List<String> sortOptions = ['Sort: Most Cited', 'Sort: Most Recent', 'Sort: Oldest First', 'Sort: Title A-Z'];
  List<String> areaOptions = ['All Areas'];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() {
      isLoading = true;
    });

    try {
      await Future.wait([
        _loadStats(),
        _loadResearchAreas(),
        _loadYearlyStats(),
        _loadAreaOptions(),
      ]);

      await _loadPublications();
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadStats() async {
    try {
      final loadedStats = await PublicationService.getLabPublicationStats(widget.lab.id);
      if (mounted) {
        setState(() {
          stats = loadedStats;
        });
      }
    } catch (e) {
      print('Failed to load stats: $e');
    }
  }

  Future<void> _loadResearchAreas() async {
    try {
      final areas = await PublicationService.getResearchAreasBreakdown(widget.lab.id);
      if (mounted) {
        setState(() {
          researchAreas = areas;
        });
      }
    } catch (e) {
      print('Failed to load research areas: $e');
    }
  }

  Future<void> _loadYearlyStats() async {
    try {
      final yearly = await PublicationService.getYearlyPublicationStats(widget.lab.id);
      if (mounted) {
        setState(() {
          yearlyStats = yearly;
        });
      }
    } catch (e) {
      print('Failed to load yearly stats: $e');
    }
  }

  Future<void> _loadAreaOptions() async {
    try {
      final filters = await PublicationService.getAvailableFilters(widget.lab.id);
      if (mounted) {
        setState(() {
          areaOptions = ['All Areas', ...filters['research_areas'] ?? []];
        });
      }
    } catch (e) {
      print('Failed to load area options: $e');
    }
  }

  Future<void> _loadPublications() async {
    setState(() {
      isLoadingPublications = true;
    });

    try {
      String? venueType;
      String? year;
      String? researchArea;
      String ordering = '-citation_count';

      // Parse filters
      if (selectedVenue == 'Top-tier Only') {
        // Add top-tier filter logic
      } else if (selectedVenue == 'Conferences') {
        venueType = 'conference';
      } else if (selectedVenue == 'Journals') {
        venueType = 'journal';
      } else if (selectedVenue == 'Workshops') {
        venueType = 'workshop';
      }

      if (selectedYear != 'All Years' && selectedYear != 'Last 5 years') {
        year = selectedYear;
      }

      if (selectedArea != 'All Areas') {
        researchArea = selectedArea;
      }

      // Parse sorting
      switch (selectedSort) {
        case 'Sort: Most Recent':
          ordering = '-year';
          break;
        case 'Sort: Oldest First':
          ordering = 'year';
          break;
        case 'Sort: Title A-Z':
          ordering = 'title';
          break;
      }

      final result = await PublicationService.getLabPublicationsWithPagination(
        widget.lab.id,
        page: currentPage,
        limit: itemsPerPage,
        query: searchQuery.isNotEmpty ? searchQuery : null,
        venueType: venueType,
        year: year,
        researchArea: researchArea,
        ordering: ordering,
      );

      if (mounted) {
        setState(() {
          publications = result['publications'] ?? [];
          totalPages = ((result['total'] ?? 0) / itemsPerPage).ceil();
          isLoadingPublications = false;
        });
      }
    } catch (e) {
      print('Failed to load publications: $e');
      if (mounted) {
        setState(() {
          isLoadingPublications = false;
        });
      }
    }
  }

  void _applyFilters() {
    setState(() {
      currentPage = 1;
    });
    _loadPublications();
  }

  void _removeFilter(String filter) {
    setState(() {
      activeFilters.remove(filter);
      if (filter.startsWith('Venue:')) {
        selectedVenue = 'All Venues';
      } else if (filter.startsWith('Year:')) {
        selectedYear = 'All Years';
      } else if (filter.startsWith('Area:')) {
        selectedArea = 'All Areas';
      }
    });
    _applyFilters();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      backgroundColor: const Color(0xFFf8fafc),
      body: Column(
        children: [
          _buildPageHeader(),
          Expanded(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 1400),
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const SizedBox(height: 32),
                    if (isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(48),
                          child: CircularProgressIndicator(),
                        ),
                      )
                    else ...[
                      _buildOverviewSection(),
                      const SizedBox(height: 24),
                      _buildResearchAreasSection(),
                      const SizedBox(height: 24),
                      _buildControlsSection(),
                      const SizedBox(height: 24),
                      _buildPublicationsList(),
                      const SizedBox(height: 32),
                      _buildPagination(),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPageHeader() {
    return Container(
      color: Colors.white,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 1400),
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Row(
              children: [
                MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: GestureDetector(
                    onTap: () => context.pop(),
                    child: const Text(
                      '← Back to Lab',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  '${widget.lab.name} - Publications',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
              ],
            ),
            const Spacer(),
            Row(
              children: [
                _buildHeaderButton('📊 Export Data', () {}),
                const SizedBox(width: 12),
                _buildHeaderButton('🔗 Share', () {}),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderButton(String text, VoidCallback onTap) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFe5e7eb)),
          borderRadius: BorderRadius.circular(6),
          color: Colors.white,
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        ),
      ),
    );
  }

  Widget _buildOverviewSection() {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 1000) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _buildResearchImpact()),
              const SizedBox(width: 24),
              Expanded(flex: 1, child: _buildTimelineWidget()),
            ],
          );
        } else {
          return Column(
            children: [
              _buildResearchImpact(),
              const SizedBox(height: 24),
              _buildTimelineWidget(),
            ],
          );
        }
      },
    );
  }

  Widget _buildResearchImpact() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📊 Research Impact Overview',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildImpactGrid(),
          const SizedBox(height: 24),
          _buildTrendInfo(),
        ],
      ),
    );
  }

  Widget _buildImpactGrid() {
    if (stats == null) {
      return const Text('Loading statistics...');
    }

    final impactItems = [
      {'number': _formatNumber(stats!.totalCitations), 'label': 'Total Citations'},
      {'number': stats!.hIndex.toString(), 'label': 'H-Index'},
      {'number': stats!.totalPublications.toString(), 'label': 'Total Publications'},
      {'number': '89%', 'label': 'Top-tier Rate'},
      {'number': stats!.thisYearPublications.toString(), 'label': 'Publications (2024)'},
      {'number': '2,847', 'label': 'Citations (2024)'},
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        int columns = 3;
        if (constraints.maxWidth < 600) columns = 2;
        if (constraints.maxWidth < 400) columns = 1;

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            crossAxisSpacing: 24,
            mainAxisSpacing: 24,
            childAspectRatio: 2.5,
          ),
          itemCount: impactItems.length,
          itemBuilder: (context, index) {
            final item = impactItems[index];
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFFf0f9ff), Color(0xFFe0f2fe)],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFbae6fd)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    item['number']!,
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0369a1),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item['label']!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF64748b),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildTrendInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFf0fdf4),
        border: Border.all(color: const Color(0xFF86efac)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '📈 Growing Research Output',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF166534),
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  '35% increase in publications compared to last year',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF166534),
                  ),
                ),
              ],
            ),
          ),
          Text(
            '📊',
            style: TextStyle(fontSize: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineWidget() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📅 Publication Timeline',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildTimelineChart(),
        ],
      ),
    );
  }

  Widget _buildTimelineChart() {
    final years = ['2020', '2021', '2022', '2023', '2024'];
    final values = [18, 24, 28, 31, 23];
    final maxValue = values.reduce((a, b) => a > b ? a : b);

    return Container(
      height: 200,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [Color(0xFFf1f5f9), Color(0xFFf8fafc)],
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(years.length, (index) {
          final height = (values[index] / maxValue) * 120;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    values[index].toString(),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1f2937),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: height,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    years[index],
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748b),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildResearchAreasSection() {
    if (researchAreas == null) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🔬 Research Areas Distribution',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
            ),
          ),
          const SizedBox(height: 24),
          _buildAreasGrid(),
        ],
      ),
    );
  }

  Widget _buildAreasGrid() {
    // Mock data for research areas
    final areas = [
      {'name': 'Computer Vision', 'papers': 48, 'percentage': 31},
      {'name': 'Natural Language Processing', 'papers': 42, 'percentage': 27},
      {'name': 'Robotics', 'papers': 35, 'percentage': 22},
      {'name': 'Machine Learning Theory', 'papers': 21, 'percentage': 13},
      {'name': 'Reinforcement Learning', 'papers': 10, 'percentage': 7},
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        int columns = 3;
        if (constraints.maxWidth < 800) columns = 2;
        if (constraints.maxWidth < 500) columns = 1;

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 2.5,
          ),
          itemCount: areas.length,
          itemBuilder: (context, index) {
            final area = areas[index];
            final isActive = selectedArea == area['name'];

            return MouseRegion(
              cursor: SystemMouseCursors.click,
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    selectedArea = area['name'] as String;
                    activeFilters.add('Area: ${area['name']}');
                  });
                  _applyFilters();
                },
                child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isActive ? AppColors.primary : const Color(0xFFe5e7eb),
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: isActive ? const Color(0xFFeff6ff) : Colors.white,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      area['name'] as String,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1f2937),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${area['papers']} papers',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF6b7280),
                          ),
                        ),
                        Text(
                          '${area['percentage']}%',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF6b7280),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFe5e7eb),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        widthFactor: (area['percentage'] as int) / 100,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildControlsSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth > 800) {
                return Row(
                  children: [
                    Expanded(child: _buildSearchBox()),
                    const SizedBox(width: 16),
                    _buildFilterDropdowns(),
                    const SizedBox(width: 16),
                    _buildSortDropdown(),
                  ],
                );
              } else {
                return Column(
                  children: [
                    _buildSearchBox(),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildFilterDropdowns()),
                        const SizedBox(width: 16),
                        _buildSortDropdown(),
                      ],
                    ),
                  ],
                );
              }
            },
          ),
          if (activeFilters.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildActiveFilters(),
          ],
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: TextField(
        onChanged: (value) {
          setState(() {
            searchQuery = value;
          });
        },
        onSubmitted: (value) => _applyFilters(),
        decoration: const InputDecoration(
          hintText: 'Search publications by title, author, or keyword...',
          prefixIcon: Icon(Icons.search, color: Color(0xFF9ca3af)),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildFilterDropdowns() {
    return Row(
      children: [
        _buildDropdown(selectedVenue, venueOptions, (value) {
          setState(() {
            selectedVenue = value!;
            if (value != 'All Venues') {
              activeFilters.add('Venue: $value');
            }
          });
          _applyFilters();
        }),
        const SizedBox(width: 8),
        _buildDropdown(selectedYear, yearOptions, (value) {
          setState(() {
            selectedYear = value!;
            if (value != 'All Years') {
              activeFilters.add('Year: $value');
            }
          });
          _applyFilters();
        }),
      ],
    );
  }

  Widget _buildSortDropdown() {
    return _buildDropdown(selectedSort, sortOptions, (value) {
      setState(() {
        selectedSort = value!;
      });
      _applyFilters();
    });
  }

  Widget _buildDropdown(String value, List<String> options, void Function(String?) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(8),
        color: Colors.white,
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          onChanged: onChanged,
          items: options.map((option) {
            return DropdownMenuItem(
              value: option,
              child: Text(
                option,
                style: const TextStyle(fontSize: 14),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildActiveFilters() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: activeFilters.map((filter) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFeff6ff),
            border: Border.all(color: AppColors.primary),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                filter,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF1e40af),
                ),
              ),
              const SizedBox(width: 8),
              MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () => _removeFilter(filter),
                  child: const Text(
                    '×',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1e40af),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPublicationsList() {
    if (isLoadingPublications) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(48),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (publications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(48),
        child: const Column(
          children: [
            Icon(
              Icons.article_outlined,
              size: 48,
              color: Color(0xFF9ca3af),
            ),
            SizedBox(height: 16),
            Text(
              'No publications found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Color(0xFF6b7280),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Try adjusting your search or filters.',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF9ca3af),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: publications.map((publication) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          child: _buildPublicationCard(publication),
        );
      }).toList(),
    );
  }

  Widget _buildPublicationCard(pub.Publication publication) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with venue and bookmark
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: publication.isTopTier
                          ? const Color(0xFFf59e0b)
                          : const Color(0xFF10b981),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      publication.venue,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    publication.year,
                    style: const TextStyle(
                      color: Color(0xFF6b7280),
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                  if (publication.isAwardPaper) ...[
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFfef3c7),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        '🏆 Best Paper',
                        style: TextStyle(
                          color: Color(0xFF92400e),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.bookmark_border),
                iconSize: 20,
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Title
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () {
                // Navigate to publication detail
              },
              child: Text(
                publication.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1f2937),
                  height: 1.4,
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Authors
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF6b7280),
              ),
              children: publication.authors.map((author) {
                final isLabAuthor = publication.labAuthors.contains(author);
                return TextSpan(
                  text: author == publication.authors.last ? author : '$author, ',
                  style: TextStyle(
                    color: isLabAuthor ? AppColors.primary : const Color(0xFF6b7280),
                    fontWeight: isLabAuthor ? FontWeight.w500 : FontWeight.normal,
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Metrics
          Row(
            children: [
              _buildMetric('📈', '${publication.citationCount} citations'),
              const SizedBox(width: 20),
              if (publication.githubStars > 0)
                _buildMetric('⭐', '${publication.githubStars} GitHub stars'),
              const SizedBox(width: 20),
              if (publication.presentationType.isNotEmpty)
                _buildMetric('💬', publication.presentationType),
            ],
          ),

          const SizedBox(height: 12),

          // Abstract
          if (publication.abstract != null)
            Text(
              publication.abstract!,
              style: const TextStyle(
                color: Color(0xFF4b5563),
                fontSize: 14,
                height: 1.6,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),

          const SizedBox(height: 12),

          // Tags
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              ...publication.researchAreaNames.map((tag) => _buildTag(tag)),
              ...publication.keywords.map((tag) => _buildTag(tag)),
            ],
          ),

          const SizedBox(height: 16),

          // Actions
          Container(
            padding: const EdgeInsets.only(top: 16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFFf3f4f6)),
              ),
            ),
            child: Wrap(
              spacing: 12,
              children: publication.links.entries.map((entry) {
                return MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: GestureDetector(
                    onTap: () => _launchUrl(entry.value),
                    child: Text(
                      '${_getIcon(entry.key)} ${entry.key}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(icon, style: const TextStyle(fontSize: 12)),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF6b7280),
          ),
        ),
      ],
    );
  }

  Widget _buildTag(String tag) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFf3f4f6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        tag,
        style: const TextStyle(
          color: Color(0xFF374151),
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildPagination() {
    if (totalPages <= 1) return const SizedBox.shrink();

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Previous button
        _buildPageButton(
          '‹ Previous',
          currentPage > 1 ? () {
            setState(() {
              currentPage--;
            });
            _loadPublications();
          } : null,
        ),

        const SizedBox(width: 8),

        // Page numbers
        ...List.generate(totalPages, (index) {
          final page = index + 1;
          final isCurrentPage = page == currentPage;

          // Show first, last, current, and adjacent pages
          if (page == 1 ||
              page == totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _buildPageButton(
                page.toString(),
                () {
                  setState(() {
                    currentPage = page;
                  });
                  _loadPublications();
                },
                isActive: isCurrentPage,
              ),
            );
          } else if (page == currentPage - 2 || page == currentPage + 2) {
            return const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4),
              child: Text('...'),
            );
          } else {
            return const SizedBox.shrink();
          }
        }),

        const SizedBox(width: 8),

        // Next button
        _buildPageButton(
          'Next ›',
          currentPage < totalPages ? () {
            setState(() {
              currentPage++;
            });
            _loadPublications();
          } : null,
        ),
      ],
    );
  }

  Widget _buildPageButton(String text, VoidCallback? onTap, {bool isActive = false}) {
    return MouseRegion(
      cursor: onTap != null ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(
            color: isActive ? AppColors.primary : const Color(0xFFe5e7eb),
          ),
          color: isActive ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: isActive ? Colors.white : (onTap != null ? const Color(0xFF374151) : const Color(0xFF9ca3af)),
            fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
          ),
        ),
        ),
      ),
    );
  }

  String _getIcon(String linkType) {
    switch (linkType.toLowerCase()) {
      case 'paper':
        return '📄';
      case 'code':
        return '💻';
      case 'video':
        return '🎥';
      case 'slides':
        return '📊';
      case 'doi':
        return '🔗';
      case 'bibtex':
        return '📖';
      default:
        return '🔗';
    }
  }

  void _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  String _formatNumber(int number) {
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}k';
    }
    return number.toString();
  }
}
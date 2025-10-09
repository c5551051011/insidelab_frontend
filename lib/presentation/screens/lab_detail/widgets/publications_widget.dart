// presentation/screens/lab_detail/widgets/publications_widget.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/publication.dart' as pub;
import '../../../../data/models/lab.dart';
import '../../../../services/publication_service.dart';
import 'package:url_launcher/url_launcher.dart';

class PublicationsWidget extends StatefulWidget {
  final String labId;
  final Lab? lab; // Optional lab object for navigation

  const PublicationsWidget({
    Key? key,
    required this.labId,
    this.lab,
  }) : super(key: key);

  @override
  State<PublicationsWidget> createState() => _PublicationsWidgetState();
}

class _PublicationsWidgetState extends State<PublicationsWidget> with AutomaticKeepAliveClientMixin {
  String selectedFilter = 'All';
  List<String> availableFilters = ['All'];
  String selectedSorting = '-citation_count';
  final Map<String, String> sortingOptions = {
    '-citation_count': 'Citations (high to low)',
    'citation_count': 'Citations (low to high)',
    '-publication_year': 'Year (newest first)',
    'publication_year': 'Year (oldest first)',
    'title': 'Title (A-Z)',
    '-title': 'Title (Z-A)',
  };
  List<pub.Publication> publications = [];
  pub.PublicationStats? stats;
  Map<String, int>? yearlyStats;
  bool isLoading = true;
  bool isLoadingPublications = false;
  bool isLoadingMore = false;
  bool hasMorePublications = true;
  int currentPage = 1;
  String? errorMessage;
  bool showAllPublications = false;
  Set<String> bookmarkedPublications = {};
  List<Map<String, dynamic>>? topResearchAreas;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    // Load stats and yearly stats together (optimized)
    await _loadStatsAndYearly();

    // Then load publications and filters in parallel
    await Future.wait([
      _loadFilters(),
      _loadPublications(),
    ]);
  }

  Future<void> _loadStatsAndYearly() async {
    if (!mounted) return;

    try {
      final statsData = await PublicationService.getLabPublicationStatsAndYearly(widget.labId);
      print('PublicationsWidget: Received stats data: $statsData');

      if (mounted && statsData != null) {
        setState(() {
          // Parse stats
          try {
            stats = pub.PublicationStats.fromJson(statsData);
            print('PublicationsWidget: Successfully parsed stats: ${stats?.totalPublications}');
          } catch (e) {
            print('PublicationsWidget: Error parsing stats: $e');
            print('PublicationsWidget: Stats data keys: ${statsData.keys}');
          }

          // Parse yearly stats and ensure exactly 5 years
          if (statsData['yearly_stats'] is Map) {
            final rawYearlyStats = Map<String, int>.from(statsData['yearly_stats']);
            yearlyStats = _ensureFiveYearStats(rawYearlyStats);
            print('PublicationsWidget: Successfully parsed yearly stats: $yearlyStats');
          } else {
            print('PublicationsWidget: No yearly_stats found or wrong type: ${statsData['yearly_stats']?.runtimeType}');
            print('PublicationsWidget: Available keys: ${statsData.keys}');
            // Create default 5-year stats with all zeros
            yearlyStats = _ensureFiveYearStats({});
          }

          // Parse top research areas from raw response
          if (statsData['raw_response'] != null) {
            final rawResponse = statsData['raw_response'] as Map<String, dynamic>;
            if (rawResponse.containsKey('top_research_areas')) {
              topResearchAreas = List<Map<String, dynamic>>.from(rawResponse['top_research_areas']);
              print('PublicationsWidget: Successfully parsed top research areas: ${topResearchAreas?.length}');
            }
          }

          isLoading = false;
        });
      } else if (mounted) {
        print('PublicationsWidget: No stats data received or widget not mounted');
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      print('Failed to load publication stats and yearly data: $e');
      print('Error details: ${e.toString()}');
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  /// Ensure exactly 5 years of data (current year - 4 to current year) with 0 for missing years
  Map<String, int> _ensureFiveYearStats(Map<String, int> rawStats) {
    final currentYear = DateTime.now().year;
    final fiveYearStats = <String, int>{};

    // Create exactly 5 years (current year - 4 to current year)
    for (int i = 4; i >= 0; i--) {
      final year = (currentYear - i).toString();
      fiveYearStats[year] = rawStats[year] ?? 0;
    }

    return fiveYearStats;
  }

  /// Get venue tier colors based on primary_venue_tier
  Map<String, dynamic> _getVenueTierStyle(String? venueTier) {
    switch (venueTier?.toLowerCase()) {
      case 'top': // S급 - 금색/주황색
        return {
          'gradient': [const Color(0xFFf59e0b), const Color(0xFFd97706)],
          'isGradient': true,
        };
      case 'good': // A급 - 파란색
        return {
          'gradient': [const Color(0xFF3b82f6), const Color(0xFF2563eb)],
          'isGradient': true,
        };
      case 'regular': // B급 - 초록색
        return {
          'gradient': [const Color(0xFF10b981), const Color(0xFF059669)],
          'isGradient': true,
        };
      case 'workshop':
      case 'preprint':
      case 'unknown':
      default: // Workshop/Preprint - 회색
        return {
          'color': const Color(0xFF6b7280),
          'isGradient': false,
        };
    }
  }

  Widget _buildTopResearchAreas() {
    if (topResearchAreas == null || topResearchAreas!.isEmpty) {
      return Container();
    }

    // Find max count for bar width calculation
    final maxCount = topResearchAreas!
        .map((area) => area['publication_count'] as int)
        .reduce((a, b) => a > b ? a : b);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '🔬',
                style: const TextStyle(fontSize: 20),
              ),
              const SizedBox(width: 8),
              const Text(
                'Top Research Areas',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1f2937),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Column(
            children: topResearchAreas!.asMap().entries.map((entry) {
              final index = entry.key;
              final area = entry.value;
              final name = area['name'] as String;
              final count = area['publication_count'] as int;
              final barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0.0;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: _buildResearchAreaItem(
                  rank: index + 1,
                  name: name,
                  count: count,
                  barWidth: barWidth,
                  isTop: index == 0,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildResearchAreaItem({
    required int rank,
    required String name,
    required int count,
    required double barWidth,
    required bool isTop,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFf8fafc),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: isTop
                    ? [const Color(0xFFf59e0b), const Color(0xFFd97706)]
                    : [const Color(0xFF3b82f6), const Color(0xFF2563eb)],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                rank.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
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
                  name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 6,
                        decoration: BoxDecoration(
                          color: const Color(0xFFe5e7eb),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: barWidth / 100,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF3b82f6), Color(0xFF2563eb)],
                              ),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$count paper${count == 1 ? '' : 's'}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF6b7280),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _loadPublications({bool loadMore = false}) async {
    if (!mounted) return;

    if (loadMore) {
      setState(() {
        isLoadingMore = true;
      });
    } else {
      setState(() {
        isLoadingPublications = true;
        errorMessage = null;
        currentPage = 1;
        publications.clear();
      });
    }

    try {
      List<pub.Publication> loadedPublications;

      // Handle different filter types
      switch (selectedFilter) {
        case 'All':
          final limit = showAllPublications ? 20 : 6;
          final offset = loadMore ? (currentPage - 1) * limit : 0;
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            ordering: selectedSorting,
            limit: limit,
            offset: offset,
            useMinimalFields: true,
          );
          break;
        case 'Top-tier':
          final limit = showAllPublications ? 20 : 6;
          loadedPublications = await PublicationService.getTopTierPublications(
            widget.labId,
            limit: limit,
            useMinimalFields: true,
          );
          break;
        case 'Award Papers':
          final limit = showAllPublications ? 20 : 6;
          loadedPublications = await PublicationService.getAwardPublications(
            widget.labId,
            limit: limit,
            useMinimalFields: true,
          );
          break;
        case 'Open Access':
          final limit = showAllPublications ? 20 : 6;
          loadedPublications = await PublicationService.getOpenAccessPublications(
            widget.labId,
            limit: limit,
            useMinimalFields: true,
          );
          break;
        case 'Recent (3 Years)':
          final limit = showAllPublications ? 20 : 6;
          loadedPublications = await PublicationService.getRecentPublications(
            widget.labId,
            limit: limit,
            useMinimalFields: true,
          );
          break;
        case 'conference':
        case 'journal':
        case 'workshop':
        case 'preprint':
          final limit = showAllPublications ? 20 : 6;
          final offset = loadMore ? (currentPage - 1) * limit : 0;
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            venueType: selectedFilter,
            ordering: selectedSorting,
            limit: limit,
            offset: offset,
            useMinimalFields: true,
          );
          break;
        default:
          final limit = showAllPublications ? 20 : 6;
          final offset = loadMore ? (currentPage - 1) * limit : 0;
          // Check if it's a year or research area
          if (RegExp(r'^\d{4}$').hasMatch(selectedFilter)) {
            // It's a year
            loadedPublications = await PublicationService.getLabPublications(
              widget.labId,
              year: selectedFilter,
              ordering: selectedSorting,
              limit: limit,
              offset: offset,
              useMinimalFields: true,
            );
          } else {
            // It's likely a research area
            loadedPublications = await PublicationService.getLabPublications(
              widget.labId,
              researchArea: selectedFilter,
              ordering: selectedSorting,
              limit: limit,
              offset: offset,
              useMinimalFields: true,
            );
          }
      }

      if (mounted) {
        setState(() {
          if (loadMore) {
            publications.addAll(loadedPublications);
            currentPage++;
            isLoadingMore = false;
          } else {
            publications = loadedPublications;
            isLoadingPublications = false;
          }
          hasMorePublications = loadedPublications.length >= (showAllPublications ? 20 : 6);
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = 'Failed to load publications: ${e.toString()}';
          isLoadingPublications = false;
          isLoadingMore = false;
        });
      }
    }
  }

  Future<void> _loadFilters() async {
    try {
      final allFilters = await PublicationService.getAvailableFilters(widget.labId);

      if (mounted) {
        setState(() {
          availableFilters = [
            'All',
            'Top-tier',
            'Award Papers',
            'Open Access',
            'Recent (3 Years)',
            ...allFilters['years']?.where((y) => y != 'All').take(3) ?? [],
            ...allFilters['venue_types']?.where((vt) => vt != 'All').take(2) ?? [],
            ...allFilters['research_areas']?.where((a) => a != 'All').take(2) ?? [],
          ];
        });
      }
    } catch (e) {
      print('Failed to load filters: $e');
    }
  }

  Future<void> _loadMorePublications() async {
    if (isLoadingMore) return;

    setState(() {
      isLoadingMore = true;
    });

    try {
      List<pub.Publication> loadedPublications;
      final currentPublicationsCount = publications.length;

      // Load additional publications starting from current count
      switch (selectedFilter) {
        case 'All':
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            ordering: selectedSorting,
            limit: 20,
            offset: currentPublicationsCount,
            useMinimalFields: true,
          );
          break;
        case 'Top-tier':
          loadedPublications = await PublicationService.getTopTierPublications(
            widget.labId,
            limit: 20,
            useMinimalFields: true,
          );
          // Remove already shown publications to avoid duplicates
          loadedPublications = loadedPublications.skip(currentPublicationsCount).toList();
          break;
        case 'Award Papers':
          loadedPublications = await PublicationService.getAwardPublications(
            widget.labId,
            limit: 20,
            useMinimalFields: true,
          );
          loadedPublications = loadedPublications.skip(currentPublicationsCount).toList();
          break;
        case 'Open Access':
          loadedPublications = await PublicationService.getOpenAccessPublications(
            widget.labId,
            limit: 20,
            useMinimalFields: true,
          );
          loadedPublications = loadedPublications.skip(currentPublicationsCount).toList();
          break;
        case 'Recent (3 Years)':
          loadedPublications = await PublicationService.getRecentPublications(
            widget.labId,
            limit: 20,
            useMinimalFields: true,
          );
          loadedPublications = loadedPublications.skip(currentPublicationsCount).toList();
          break;
        default:
          // Handle year, venue type, or research area filters
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            researchArea: selectedFilter,
            ordering: selectedSorting,
            limit: 20,
            offset: currentPublicationsCount,
            useMinimalFields: true,
          );
      }

      if (mounted) {
        setState(() {
          publications.addAll(loadedPublications);
          hasMorePublications = loadedPublications.length >= 20;
          isLoadingMore = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = 'Failed to load more publications: ${e.toString()}';
          isLoadingMore = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFe5e7eb),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                /*Text(
                  '📚',
                  style: TextStyle(fontSize: 20),
                ),
                SizedBox(width: 8),
                */
                Text(
                  'Research Publications',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(),
                ),
              )
            else ...[
              _buildPublicationStats(),
              const SizedBox(height: 24),
              if (yearlyStats != null) ...[
                _buildPublicationTimeline(),
                const SizedBox(height: 24),
              ],
              if (topResearchAreas != null && topResearchAreas!.isNotEmpty) ...[
                _buildTopResearchAreas(),
                const SizedBox(height: 24),
              ],
              _buildFilters(),
              const SizedBox(height: 20),
              if (errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red, size: 48),
                      const SizedBox(height: 8),
                      Text(
                        errorMessage!,
                        style: TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadPublications,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              else if (isLoadingPublications)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: CircularProgressIndicator(),
                  ),
                )
              else
                _buildPublicationsList(),
            ],
            const SizedBox(height: 16),
            _buildViewAllButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildPublicationStats() {
    if (stats == null) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFf0f9ff), Color(0xFFe0f2fe)],
          ),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF0ea5e9)),
        ),
        child: const Text(
          'Publication statistics not available',
          style: TextStyle(color: Color(0xFF0369a1)),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFf0f9ff), Color(0xFFe0f2fe)],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF0ea5e9)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _buildStatItem(_formatNumber(stats!.totalCitations), 'Total Citations')),
              Expanded(child: _buildStatItem(stats!.hIndex.toString(), 'H-Index')),
              Expanded(child: _buildStatItem(stats!.totalPublications.toString(), 'Publications')),
              Expanded(child: _buildStatItem(stats!.thisYearPublications.toString(), 'Recent 5 Years')),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildStatItem(
                stats!.averageCitationsPerPaper != null
                  ? stats!.averageCitationsPerPaper!.toStringAsFixed(1)
                  : '0.0',
                'Avg Citations/Paper')),
              Expanded(child: _buildStatItem('100%', 'Open Access')), // Based on API response
              Expanded(child: Container()), // Empty space
              Expanded(child: Container()), // Empty space
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Color(0xFF0369a1),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF64748b),
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPublicationTimeline() {
    if (yearlyStats == null) return Container();

    final years = yearlyStats!.keys.toList()..sort();
    final values = years.map((year) => yearlyStats![year]!).toList();
    final maxValue = values.isNotEmpty ? values.reduce((a, b) => a > b ? a : b) : 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFe5e7eb)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📈 Publication Timeline',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 80,
            child: CustomPaint(
              size: Size(double.infinity, 80),
              painter: TimelineChartPainter(years, values, maxValue),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: availableFilters.map((filter) {
            final isActive = filter == selectedFilter;
            return MouseRegion(
              cursor: SystemMouseCursors.click,
              child: GestureDetector(
                onTap: () {
                  if (mounted) {
                    setState(() {
                      selectedFilter = filter;
                    });
                    _loadPublications();
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : const Color(0xFFf1f5f9),
                    border: Border.all(
                      color: isActive ? AppColors.primary : const Color(0xFFe2e8f0),
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    filter,
                    style: TextStyle(
                      fontSize: 13,
                      color: isActive ? Colors.white : const Color(0xFF64748b),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Text(
              'Sort by: ',
              style: TextStyle(
                fontSize: 12,
                color: const Color(0xFF6b7280),
                fontWeight: FontWeight.w500,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFe2e8f0)),
                borderRadius: BorderRadius.circular(6),
                color: Colors.white,
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: selectedSorting,
                  isDense: true,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF374151),
                  ),
                  items: sortingOptions.entries.map((entry) {
                    return DropdownMenuItem<String>(
                      value: entry.key,
                      child: Text(entry.value),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    if (newValue != null && mounted) {
                      setState(() {
                        selectedSorting = newValue;
                      });
                      _loadPublications();
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPublicationsList() {
    if (publications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            Icon(
              Icons.article_outlined,
              size: 48,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No publications found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              selectedFilter == 'All'
                  ? 'This lab has no publications yet.'
                  : 'No publications found for the selected filter.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    final displayCount = showAllPublications ? publications.length : 2;
    return Column(
      children: publications.take(displayCount).map<Widget>((publication) =>
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildPublicationItemFromModel(publication),
        ),
      ).toList(),
    );
  }

  Widget _buildPublicationItemFromModel(pub.Publication publication) {
    return _buildPublicationItem(
      venue: publication.venue,
      venueTier: publication.primaryVenueTier,
      year: publication.year,
      title: publication.title,
      authors: publication.authors,
      labAuthors: publication.labAuthors,
      citations: publication.citationCount,
      abstract: publication.abstract ?? '',
      tags: [...(publication.researchAreaNames ?? []), ...(publication.keywords ?? [])],
      links: publication.links,
      isAwardPaper: publication.isAwardPaper,
      githubStars: publication.githubStars,
      additionalNotes: publication.additionalNotes,
    );
  }

  Widget _buildPublicationItem({
    required String venue,
    String? venueTier,
    required String year,
    required String title,
    required List<String> authors,
    required List<String> labAuthors,
    required int citations,
    required String abstract,
    required List<String> tags,
    required Map<String, String> links,
    bool isAwardPaper = false,
    int githubStars = 0,
    String? additionalNotes,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Builder(
                    builder: (context) {
                      final tierStyle = _getVenueTierStyle(venueTier);
                      final isGradient = tierStyle['isGradient'] as bool;

                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          gradient: isGradient
                              ? LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: tierStyle['gradient'] as List<Color>,
                                )
                              : null,
                          color: isGradient ? null : tierStyle['color'] as Color,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          venue,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      );
                    },
                  ),
                  if (isAwardPaper) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFfef3c7),
                        borderRadius: BorderRadius.circular(4),
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
              Row(
                children: [
                  Text(
                    year,
                    style: const TextStyle(
                      color: Color(0xFF6b7280),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 8),
                  MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      onTap: () => _toggleBookmark(title),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        child: Icon(
                          _isBookmarked(title) ? Icons.bookmark : Icons.bookmark_border,
                          color: _isBookmarked(title) ? AppColors.primary : Colors.grey[600],
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 8),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF6b7280),
              ),
              children: authors.map((author) {
                final isLabAuthor = labAuthors.contains(author);
                return TextSpan(
                  text: author == authors.last ? author : '$author, ',
                  style: TextStyle(
                    color: isLabAuthor ? AppColors.primary : const Color(0xFF6b7280),
                    fontWeight: isLabAuthor ? FontWeight.w500 : FontWeight.normal,
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            children: [
              _buildMetric('📈', '$citations citations'),
              if (githubStars > 0)
                _buildMetric('⭐', '$githubStars GitHub stars'),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            abstract,
            style: const TextStyle(
              color: Color(0xFF4b5563),
              fontSize: 14,
              height: 1.5,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (additionalNotes != null && additionalNotes!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFf8fafc),
                border: Border.all(color: const Color(0xFFe2e8f0)),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '💡 ',
                    style: TextStyle(fontSize: 12),
                  ),
                  Expanded(
                    child: Text(
                      additionalNotes!,
                      style: const TextStyle(
                        color: Color(0xFF475569),
                        fontSize: 12,
                        fontStyle: FontStyle.italic,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: tags.map((tag) => _buildTag(tag)).toList(),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: links.entries.map((entry) {
              return MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () => _launchUrl(entry.value),
                  child: Text(
                    '${_getIcon(entry.key)} ${entry.key}',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              );
            }).toList(),
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
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFf3f4f6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        tag,
        style: const TextStyle(
          color: Color(0xFF374151),
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildViewAllButton() {
    if (!showAllPublications) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: () {
            setState(() {
              showAllPublications = true;
              currentPage = 1; // Reset page for proper offset calculation
            });
            _loadMorePublications();
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFf8fafc),
              border: Border.all(color: const Color(0xFFe5e7eb)),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'View All Publications',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    if (hasMorePublications) {
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: isLoadingMore ? null : () => _loadPublications(loadMore: true),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFf8fafc),
              border: Border.all(color: const Color(0xFFe5e7eb)),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoadingMore) ...[
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  const SizedBox(width: 8),
                ],
                Text(
                  isLoadingMore ? 'Loading...' : 'Load More Publications',
                  style: TextStyle(
                    color: isLoadingMore ? Colors.grey[600] : AppColors.primary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFf3f4f6),
        border: Border.all(color: const Color(0xFFe5e7eb)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        'All publications loaded',
        style: TextStyle(
          color: Colors.grey[600],
          fontWeight: FontWeight.w500,
        ),
        textAlign: TextAlign.center,
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
      default:
        return '🔗';
    }
  }

  void _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  bool _isBookmarked(String title) {
    return bookmarkedPublications.contains(title);
  }

  void _toggleBookmark(String title) {
    setState(() {
      if (bookmarkedPublications.contains(title)) {
        bookmarkedPublications.remove(title);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Removed from bookmarks'),
            duration: Duration(seconds: 1),
          ),
        );
      } else {
        bookmarkedPublications.add(title);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Added to bookmarks'),
            duration: Duration(seconds: 1),
          ),
        );
      }
    });
  }

  String _formatNumber(int number) {
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}k';
    }
    return number.toString();
  }
}

class TimelineChartPainter extends CustomPainter {
  final List<String> years;
  final List<int> values;
  final int maxValue;

  TimelineChartPainter(this.years, this.values, this.maxValue);

  @override
  void paint(Canvas canvas, Size size) {
    if (years.isEmpty || values.isEmpty) return;

    final paint = Paint()
      ..color = const Color(0xFF0ea5e9)
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;

    final pointPaint = Paint()
      ..color = const Color(0xFF0ea5e9)
      ..style = PaintingStyle.fill;

    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    );

    final chartHeight = size.height - 30; // Reserve space for labels
    final chartWidth = size.width - 40; // Reserve space for margins
    final stepX = chartWidth / (years.length - 1);

    // Draw line chart
    final path = Path();
    for (int i = 0; i < values.length; i++) {
      final x = 20 + i * stepX;
      final y = 10 + (chartHeight - 20) * (1 - values[i] / maxValue);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }

      // Draw points
      canvas.drawCircle(Offset(x, y), 3, pointPaint);

      // Draw values on top of points
      textPainter.text = TextSpan(
        text: values[i].toString(),
        style: const TextStyle(
          fontSize: 10,
          color: Color(0xFF374151),
          fontWeight: FontWeight.w500,
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(x - textPainter.width / 2, y - 20));

      // Draw year labels at bottom
      textPainter.text = TextSpan(
        text: years[i],
        style: const TextStyle(
          fontSize: 9,
          color: Color(0xFF6b7280),
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(x - textPainter.width / 2, size.height - 15));
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}
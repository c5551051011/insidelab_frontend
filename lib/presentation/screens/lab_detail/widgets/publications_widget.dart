// presentation/screens/lab_detail/widgets/publications_widget.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/publication.dart';
import '../../../../data/models/lab.dart' hide Publication;
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
  List<Publication> publications = [];
  PublicationStats? stats;
  Map<String, int>? yearlyStats;
  bool isLoading = true;
  bool isLoadingPublications = false;
  bool isLoadingMore = false;
  bool hasMorePublications = true;
  int currentPage = 1;
  String? errorMessage;
  bool showAllPublications = false;
  Set<String> bookmarkedPublications = {};

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    // Load stats first (fastest)
    await _loadStats();

    // Then load publications, filters, and yearly stats in parallel
    await Future.wait([
      _loadFilters(),
      _loadPublications(),
      _loadYearlyStats(),
    ]);
  }

  Future<void> _loadStats() async {
    if (!mounted) return;

    try {
      final loadedStats = await PublicationService.getLabPublicationStats(widget.labId);

      if (mounted) {
        setState(() {
          stats = loadedStats;
          isLoading = false;
        });
      }
    } catch (e) {
      print('Failed to load publication stats: $e');
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> _loadYearlyStats() async {
    try {
      final yearly = await PublicationService.getYearlyPublicationStats(
        widget.labId,
        fillEmpty: true,
      );
      if (mounted) {
        setState(() {
          yearlyStats = yearly;
        });
      }
    } catch (e) {
      print('Failed to load yearly stats: $e');
      // Use fallback mock data
      if (mounted) {
        setState(() {
          yearlyStats = {
            '2020': 18,
            '2021': 24,
            '2022': 28,
            '2023': 31,
            '2024': 23,
          };
        });
      }
    }
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
      List<Publication> loadedPublications;

      // Handle different filter types
      switch (selectedFilter) {
        case 'All':
          final limit = showAllPublications ? 20 : 6;
          final offset = loadMore ? (currentPage - 1) * limit : 0;
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            ordering: '-citation_count',
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
            ordering: '-citation_count',
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
              ordering: '-citation_count',
              limit: limit,
              offset: offset,
              useMinimalFields: true,
            );
          } else {
            // It's likely a research area
            loadedPublications = await PublicationService.getLabPublications(
              widget.labId,
              researchArea: selectedFilter,
              ordering: '-citation_count',
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
      child: Row(
        children: [
          Expanded(child: _buildStatItem(_formatNumber(stats!.totalCitations), 'Total Citations')),
          Expanded(child: _buildStatItem(stats!.hIndex.toString(), 'H-Index')),
          Expanded(child: _buildStatItem(stats!.totalPublications.toString(), 'Publications')),
          Expanded(child: _buildStatItem(stats!.thisYearPublications.toString(), 'This Year')),
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
            '📊 Publication Timeline',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1f2937),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            height: 100,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: years.map((year) {
                final value = yearlyStats![year]!;
                final height = (value / maxValue) * 70;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          value.toString(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF6b7280),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          height: height,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [Color(0xFF0ea5e9), Color(0xFF0284c7)],
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          year,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF374151),
                          ),
                        ),
                      ],
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

  Widget _buildFilters() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: availableFilters.map((filter) {
        final isActive = filter == selectedFilter;
        return GestureDetector(
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
        );
      }).toList(),
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

  Widget _buildPublicationItemFromModel(Publication publication) {
    return _buildPublicationItem(
      venue: publication.venue,
      isTopTier: publication.isTopTier,
      year: publication.year,
      title: publication.title,
      authors: publication.authors,
      labAuthors: publication.labAuthors,
      citations: publication.citationCount,
      abstract: publication.abstract ?? '',
      tags: [...publication.researchAreaNames ?? [], ...publication.keywords ?? []],
      links: publication.links,
      isAwardPaper: publication.isAwardPaper,
      githubStars: publication.githubStars,
      additionalNotes: publication.additionalNotes,
    );
  }

  Widget _buildPublicationItem({
    required String venue,
    required bool isTopTier,
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isTopTier ? const Color(0xFFf59e0b) : const Color(0xFF10b981),
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
            });
            _loadPublications();
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
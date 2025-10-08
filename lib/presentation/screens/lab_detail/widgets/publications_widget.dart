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
  bool isLoading = true;
  bool isLoadingPublications = false;
  String? errorMessage;

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

    // Then load publications and filters in parallel
    await Future.wait([
      _loadFilters(),
      _loadPublications(),
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

  Future<void> _loadPublications() async {
    if (!mounted) return;

    setState(() {
      isLoadingPublications = true;
      errorMessage = null;
    });

    try {
      List<Publication> loadedPublications;

      // Handle different filter types
      switch (selectedFilter) {
        case 'All':
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            ordering: '-citation_count',
            limit: 6,
            useMinimalFields: true, // Optimize for lab detail
          );
          break;
        case 'Top-tier':
          loadedPublications = await PublicationService.getTopTierPublications(
            widget.labId,
            limit: 6,
            useMinimalFields: true,
          );
          break;
        case 'Award Papers':
          loadedPublications = await PublicationService.getAwardPublications(
            widget.labId,
            limit: 6,
            useMinimalFields: true,
          );
          break;
        case 'Open Access':
          loadedPublications = await PublicationService.getOpenAccessPublications(
            widget.labId,
            limit: 6,
            useMinimalFields: true,
          );
          break;
        case 'Recent (3 Years)':
          loadedPublications = await PublicationService.getRecentPublications(
            widget.labId,
            limit: 6,
            useMinimalFields: true,
          );
          break;
        case 'conference':
        case 'journal':
        case 'workshop':
        case 'preprint':
          loadedPublications = await PublicationService.getLabPublications(
            widget.labId,
            venueType: selectedFilter,
            ordering: '-citation_count',
            limit: 6,
            useMinimalFields: true,
          );
          break;
        default:
          // Check if it's a year or research area
          if (RegExp(r'^\d{4}$').hasMatch(selectedFilter)) {
            // It's a year
            loadedPublications = await PublicationService.getLabPublications(
              widget.labId,
              year: selectedFilter,
              ordering: '-citation_count',
              limit: 6,
              useMinimalFields: true,
            );
          } else {
            // It's likely a research area
            loadedPublications = await PublicationService.getLabPublications(
              widget.labId,
              researchArea: selectedFilter,
              ordering: '-citation_count',
              limit: 6,
              useMinimalFields: true,
            );
          }
      }

      if (mounted) {
        setState(() {
          publications = loadedPublications;
          isLoadingPublications = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = 'Failed to load publications: ${e.toString()}';
          isLoadingPublications = false;
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

    return Column(
      children: publications.take(2).map<Widget>((publication) =>
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
              Text(
                year,
                style: const TextStyle(
                  color: Color(0xFF6b7280),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
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
              return GestureDetector(
                onTap: () => _launchUrl(entry.value),
                child: Text(
                  '${_getIcon(entry.key)} ${entry.key}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
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
    final totalPubs = stats?.totalPublications ?? publications.length;
    final remainingPubs = totalPubs - publications.take(2).length;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          if (widget.lab != null) {
            context.push('/all-publications', extra: widget.lab!);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Please try again from the lab detail page'),
              ),
            );
          }
        },
        child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFf8fafc),
          border: Border.all(color: const Color(0xFFe5e7eb)),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          remainingPubs > 0
              ? 'View All Publications ($remainingPubs more)'
              : 'View All Publications',
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
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
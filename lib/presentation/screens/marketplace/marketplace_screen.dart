// presentation/screens/marketplace/marketplace_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/service.dart';
import '../../../data/models/user.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/marketplace/service_card.dart';
import '../../widgets/marketplace/service_filters.dart';
import '../../widgets/marketplace/service_sort.dart';
import '../../widgets/common/loading_state.dart';

class MarketplaceScreen extends StatefulWidget {
  final String? initialQuery;
  final ServiceType? initialServiceType;

  const MarketplaceScreen({
    Key? key,
    this.initialQuery,
    this.initialServiceType,
  }) : super(key: key);

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  final TextEditingController _searchController = TextEditingController();
  ServiceFilter _currentFilter = ServiceFilter();
  String _currentSort = 'relevance';
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    
    // Initialize with passed parameters
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
      _currentFilter = _currentFilter.copyWith(searchQuery: widget.initialQuery);
    }
    
    if (widget.initialServiceType != null) {
      _currentFilter = _currentFilter.copyWith(
        types: {widget.initialServiceType!}
      );
    }
    
    // Load services
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadServices();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Column(
        children: [
          _buildSearchHeader(),
          if (_showFilters) _buildFiltersPanel(),
          Expanded(
            child: Row(
              children: [
                if (MediaQuery.of(context).size.width >= 1024) ...[
                  Container(
                    width: 280,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      border: Border(
                        right: BorderSide(color: AppColors.border),
                      ),
                    ),
                    child: ServiceFilters(
                      filter: _currentFilter,
                      onFilterChanged: _updateFilter,
                    ),
                  ),
                ],
                Expanded(
                  child: _buildServiceGrid(),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          if (user?.hasRole(UserRole.provider) == true) {
            return FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/create-service'),
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text(
                'Create Service', 
                style: TextStyle(color: Colors.white),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search services, skills, or providers...',
                      hintStyle: TextStyle(color: AppColors.textSecondary),
                      prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.clear, color: AppColors.textSecondary),
                              onPressed: () {
                                _searchController.clear();
                                _updateFilter(_currentFilter.copyWith(searchQuery: ''));
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 14
                      ),
                    ),
                    onSubmitted: (query) {
                      _updateFilter(_currentFilter.copyWith(searchQuery: query));
                    },
                  ),
                ),
              ),
              const SizedBox(width: 16),
              if (MediaQuery.of(context).size.width < 1024)
                Container(
                  decoration: BoxDecoration(
                    color: _showFilters ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _showFilters ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: IconButton(
                    onPressed: () {
                      setState(() {
                        _showFilters = !_showFilters;
                      });
                    },
                    icon: Icon(
                      Icons.tune,
                      color: _showFilters ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                child: ServiceSort(
                  currentSort: _currentSort,
                  onSortChanged: (sort) {
                    setState(() {
                      _currentSort = sort;
                    });
                    _loadServices();
                  },
                ),
              ),
            ],
          ),
          if (_currentFilter.activeFiltersCount > 0) ...[
            const SizedBox(height: 16),
            _buildActiveFilters(),
          ],
        ],
      ),
    );
  }

  Widget _buildFiltersPanel() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: ServiceFilters(
        filter: _currentFilter,
        onFilterChanged: _updateFilter,
        isCompact: true,
      ),
    );
  }

  Widget _buildActiveFilters() {
    List<Widget> chips = [];

    // Search query chip
    if (_currentFilter.searchQuery != null && 
        _currentFilter.searchQuery!.trim().isNotEmpty) {
      chips.add(
        Chip(
          label: Text('"${_currentFilter.searchQuery}"'),
          deleteIcon: const Icon(Icons.close, size: 18),
          onDeleted: () {
            _searchController.clear();
            _updateFilter(_currentFilter.copyWith(searchQuery: ''));
          },
        ),
      );
    }

    // Service type chips
    for (final type in _currentFilter.types) {
      chips.add(
        Chip(
          label: Text(_getServiceTypeDisplayName(type)),
          deleteIcon: const Icon(Icons.close, size: 18),
          onDeleted: () {
            final newTypes = Set<ServiceType>.from(_currentFilter.types);
            newTypes.remove(type);
            _updateFilter(_currentFilter.copyWith(types: newTypes));
          },
        ),
      );
    }

    // Price range chip
    if (_currentFilter.minPrice != null || _currentFilter.maxPrice != null) {
      String priceText = '';
      if (_currentFilter.minPrice != null && _currentFilter.maxPrice != null) {
        priceText = '\$${_currentFilter.minPrice!.toInt()}-\$${_currentFilter.maxPrice!.toInt()}';
      } else if (_currentFilter.minPrice != null) {
        priceText = 'Over \$${_currentFilter.minPrice!.toInt()}';
      } else {
        priceText = 'Under \$${_currentFilter.maxPrice!.toInt()}';
      }
      
      chips.add(
        Chip(
          label: Text(priceText),
          deleteIcon: const Icon(Icons.close, size: 18),
          onDeleted: () {
            _updateFilter(_currentFilter.copyWith(
              minPrice: null, 
              maxPrice: null,
            ));
          },
        ),
      );
    }

    // Rating chip
    if (_currentFilter.minRating != null) {
      chips.add(
        Chip(
          label: Text('${_currentFilter.minRating}+ stars'),
          deleteIcon: const Icon(Icons.close, size: 18),
          onDeleted: () {
            _updateFilter(_currentFilter.copyWith(minRating: null));
          },
        ),
      );
    }

    if (chips.isEmpty) return const SizedBox.shrink();

    return Row(
      children: [
        Text(
          'Active filters:',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: chips,
          ),
        ),
        TextButton(
          onPressed: () {
            _searchController.clear();
            _updateFilter(ServiceFilter());
          },
          child: const Text('Clear all'),
        ),
      ],
    );
  }

  Widget _buildServiceGrid() {
    // For now, show demo data until we implement the service provider
    final services = _getDemoServices();
    
    if (services.isEmpty) {
      return _buildEmptyState();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildResultsHeader(services.length),
          const SizedBox(height: 24),
          _buildServicesList(services),
        ],
      ),
    );
  }

  Widget _buildResultsHeader(int count) {
    return Row(
      children: [
        Text(
          '$count ${count == 1 ? 'service' : 'services'} found',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const Spacer(),
        Text(
          'Sorted by $_currentSort',
          style: TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildServicesList(List<Service> services) {
    if (MediaQuery.of(context).size.width >= 1200) {
      // Desktop: 3 columns
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          childAspectRatio: 0.8,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) => ServiceCard(service: services[index]),
      );
    } else if (MediaQuery.of(context).size.width >= 768) {
      // Tablet: 2 columns
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.9,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) => ServiceCard(service: services[index]),
      );
    } else {
      // Mobile: 1 column
      return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: services.length,
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: ServiceCard(
            service: services[index], 
            isCompact: true,
          ),
        ),
      );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 80,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24),
          Text(
            'No services found',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _currentFilter.isEmpty
                ? 'Try adjusting your search terms or filters'
                : 'Try different search terms or remove some filters',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          if (!_currentFilter.isEmpty)
            OutlinedButton(
              onPressed: () {
                _searchController.clear();
                _updateFilter(ServiceFilter());
              },
              child: const Text('Clear all filters'),
            ),
        ],
      ),
    );
  }

  void _updateFilter(ServiceFilter newFilter) {
    setState(() {
      _currentFilter = newFilter;
    });
    _loadServices();
  }

  void _loadServices() {
    // TODO: Implement service loading with provider
    // context.read<ServiceProvider>().searchServices(_currentFilter, _currentSort);
  }

  String _getServiceTypeDisplayName(ServiceType type) {
    switch (type) {
      case ServiceType.mockInterview:
        return 'Mock Interview';
      case ServiceType.cvReview:
        return 'CV Review';
      case ServiceType.sopEditing:
        return 'SOP Editing';
      case ServiceType.mentorship:
        return 'Mentorship';
      case ServiceType.researchGuidance:
        return 'Research Guidance';
      case ServiceType.applicationReview:
        return 'Application Review';
      case ServiceType.custom:
        return 'Custom Service';
    }
  }

  List<Service> _getDemoServices() {
    return [
      Service(
        id: '1',
        providerId: 'provider1',
        title: 'PhD Mock Interview - Computer Science',
        description: 'Get personalized mock interview sessions for PhD programs in Computer Science. I\'ll help you prepare for technical questions, research discussions, and academic fit conversations.',
        type: ServiceType.mockInterview,
        status: ServiceStatus.active,
        basePrice: 75.0,
        tags: ['PhD', 'Computer Science', 'Technical Interview', 'Research'],
        availability: ServiceAvailability(
          weeklySlots: {
            'monday': [TimeSlot(startTime: const TimeOfDay(hour: 14, minute: 0), endTime: const TimeOfDay(hour: 17, minute: 0))],
            'wednesday': [TimeSlot(startTime: const TimeOfDay(hour: 10, minute: 0), endTime: const TimeOfDay(hour: 12, minute: 0))],
          },
          timezone: 'America/New_York',
        ),
        stats: ServiceStats(
          averageRating: 4.9,
          totalReviews: 23,
          completedOrders: 45,
          responseTimeMinutes: 120,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        updatedAt: DateTime.now(),
      ),
      Service(
        id: '2',
        providerId: 'provider2',
        title: 'CV Review & Optimization',
        description: 'Professional CV review for graduate school applications. I\'ll provide detailed feedback on format, content, and academic presentation to maximize your chances.',
        type: ServiceType.cvReview,
        status: ServiceStatus.active,
        basePrice: 45.0,
        tags: ['CV Review', 'Graduate School', 'Academic Writing'],
        availability: ServiceAvailability(
          weeklySlots: {},
          timezone: 'America/Los_Angeles',
        ),
        stats: ServiceStats(
          averageRating: 4.7,
          totalReviews: 89,
          completedOrders: 156,
          responseTimeMinutes: 360,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 60)),
        updatedAt: DateTime.now(),
        deliveryTime: DeliveryTime.threeDays,
      ),
      Service(
        id: '3',
        providerId: 'provider3',
        title: 'SOP Editing & Feedback',
        description: 'Expert editing and feedback for Statement of Purpose essays. I\'ll help you craft a compelling narrative that showcases your research interests and academic goals.',
        type: ServiceType.sopEditing,
        status: ServiceStatus.active,
        basePrice: 120.0,
        tags: ['SOP', 'Personal Statement', 'Writing', 'Graduate School'],
        availability: ServiceAvailability(
          weeklySlots: {},
          timezone: 'Europe/London',
        ),
        stats: ServiceStats(
          averageRating: 4.8,
          totalReviews: 67,
          completedOrders: 134,
          responseTimeMinutes: 480,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 45)),
        updatedAt: DateTime.now(),
        deliveryTime: DeliveryTime.oneWeek,
      ),
    ];
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
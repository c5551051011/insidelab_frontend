// presentation/screens/provider/my_services_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/service.dart';
import '../../../data/models/user.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/common/loading_state.dart';
import '../../widgets/provider/service_stats_card.dart';
import '../../widgets/provider/service_management_card.dart';

class MyServicesScreen extends StatefulWidget {
  const MyServicesScreen({Key? key}) : super(key: key);

  @override
  State<MyServicesScreen> createState() => _MyServicesScreenState();
}

class _MyServicesScreenState extends State<MyServicesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  ServiceStatus _filterStatus = ServiceStatus.active;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          
          if (user == null || !user.canProvideServices) {
            return const Center(child: Text('Access denied'));
          }

          return Column(
            children: [
              _buildHeader(context),
              _buildStatsOverview(context),
              _buildTabBar(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildServicesList(context, ServiceStatus.active),
                    _buildServicesList(context, ServiceStatus.paused),
                    _buildServicesList(context, ServiceStatus.draft),
                    _buildAnalytics(context),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/create-service'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'Create Service',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'My Services',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Manage your service offerings and track performance',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              OutlinedButton.icon(
                onPressed: () => _showServiceTips(context),
                icon: const Icon(Icons.lightbulb_outline, size: 20),
                label: const Text('Tips'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsOverview(BuildContext context) {
    final services = _getDemoServices();
    final activeServices = services.where((s) => s.status == ServiceStatus.active).length;
    final totalBookings = services.fold(0, (sum, s) => sum + s.stats.completedOrders);
    final avgRating = services.isEmpty ? 0.0 : services.fold(0.0, (sum, s) => sum + s.stats.averageRating) / services.length;
    final totalEarnings = totalBookings * 75.0; // Demo calculation

    return Container(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Row(
            children: [
              Expanded(
                child: ServiceStatsCard(
                  title: 'Active Services',
                  value: activeServices.toString(),
                  icon: Icons.work,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ServiceStatsCard(
                  title: 'Total Bookings',
                  value: totalBookings.toString(),
                  icon: Icons.book_online,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ServiceStatsCard(
                  title: 'Average Rating',
                  value: avgRating.toStringAsFixed(1),
                  icon: Icons.star,
                  color: Colors.amber,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ServiceStatsCard(
                  title: 'Total Earnings',
                  value: '\$${totalEarnings.toInt()}',
                  icon: Icons.account_balance_wallet,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: TabBar(
        controller: _tabController,
        tabs: const [
          Tab(text: 'Active'),
          Tab(text: 'Paused'),
          Tab(text: 'Drafts'),
          Tab(text: 'Analytics'),
        ],
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
      ),
    );
  }

  Widget _buildServicesList(BuildContext context, ServiceStatus status) {
    final services = _getDemoServices().where((s) => s.status == status).toList();

    if (services.isEmpty) {
      return _buildEmptyState(context, status);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${services.length} ${_getStatusDisplayName(status)} Services',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (status == ServiceStatus.active)
                    TextButton.icon(
                      onPressed: () => _showBulkActions(context),
                      icon: const Icon(Icons.more_horiz, size: 16),
                      label: const Text('Bulk Actions'),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              ...services.map((service) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ServiceManagementCard(
                  service: service,
                  onEdit: () => _editService(context, service),
                  onToggleStatus: () => _toggleServiceStatus(context, service),
                  onViewStats: () => _viewServiceStats(context, service),
                  onDelete: () => _deleteService(context, service),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ServiceStatus status) {
    String title, subtitle, actionText;
    IconData icon;

    switch (status) {
      case ServiceStatus.active:
        icon = Icons.work_outline;
        title = 'No Active Services';
        subtitle = 'Create your first service to start earning money from your expertise.';
        actionText = 'Create Service';
        break;
      case ServiceStatus.paused:
        icon = Icons.pause_circle_outline;
        title = 'No Paused Services';
        subtitle = 'Services you temporarily pause will appear here.';
        actionText = 'View Active Services';
        break;
      case ServiceStatus.draft:
        icon = Icons.drafts;
        title = 'No Draft Services';
        subtitle = 'Save incomplete services as drafts to finish later.';
        actionText = 'Create Draft';
        break;
      default:
        icon = Icons.work_outline;
        title = 'No Services';
        subtitle = 'No services found.';
        actionText = 'Create Service';
    }

    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 80, color: AppColors.textTertiary),
            const SizedBox(height: 24),
            Text(
              title,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                if (status == ServiceStatus.paused) {
                  _tabController.animateTo(0); // Switch to Active tab
                } else {
                  Navigator.pushNamed(context, '/create-service');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: Text(actionText),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalytics(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Service Analytics',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              Card(
                child: Container(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(
                        Icons.analytics,
                        size: 64,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Analytics Coming Soon',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Detailed analytics about your service performance, booking trends, and earnings will be available here.',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Service> _getDemoServices() {
    return [
      Service(
        id: '1',
        providerId: 'current_user',
        title: 'PhD Mock Interview - Computer Science',
        description: 'Comprehensive mock interview preparation for PhD programs in Computer Science.',
        type: ServiceType.mockInterview,
        status: ServiceStatus.active,
        basePrice: 75.0,
        tags: ['PhD', 'Computer Science', 'Interview', 'Research'],
        availability: ServiceAvailability(
          weeklySlots: {
            'monday': [TimeSlot(startTime: const TimeOfDay(hour: 14, minute: 0), endTime: const TimeOfDay(hour: 17, minute: 0))],
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
        providerId: 'current_user',
        title: 'CV Review & Optimization',
        description: 'Professional CV review with detailed feedback and suggestions.',
        type: ServiceType.cvReview,
        status: ServiceStatus.paused,
        basePrice: 45.0,
        tags: ['CV', 'Resume', 'Review', 'Feedback'],
        availability: ServiceAvailability(
          weeklySlots: {},
          timezone: 'America/New_York',
        ),
        stats: ServiceStats(
          averageRating: 4.7,
          totalReviews: 34,
          completedOrders: 67,
          responseTimeMinutes: 240,
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 60)),
        updatedAt: DateTime.now(),
      ),
    ];
  }

  String _getStatusDisplayName(ServiceStatus status) {
    switch (status) {
      case ServiceStatus.active:
        return 'Active';
      case ServiceStatus.paused:
        return 'Paused';
      case ServiceStatus.draft:
        return 'Draft';
      case ServiceStatus.archived:
        return 'Archived';
    }
  }

  void _editService(BuildContext context, Service service) {
    Navigator.pushNamed(
      context,
      '/edit-service',
      arguments: service,
    );
  }

  void _toggleServiceStatus(BuildContext context, Service service) {
    final newStatus = service.status == ServiceStatus.active 
        ? ServiceStatus.paused 
        : ServiceStatus.active;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Service ${newStatus == ServiceStatus.active ? 'activated' : 'paused'}'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _viewServiceStats(BuildContext context, Service service) {
    Navigator.pushNamed(
      context,
      '/service-stats',
      arguments: service,
    );
  }

  void _deleteService(BuildContext context, Service service) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Service'),
        content: Text('Are you sure you want to delete "${service.title}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Service deleted'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showServiceTips(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.lightbulb, color: AppColors.primary),
            const SizedBox(width: 8),
            const Text('Service Tips'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('💡 Write clear, detailed service descriptions'),
            const SizedBox(height: 8),
            const Text('⭐ Respond quickly to booking requests'),
            const SizedBox(height: 8),
            const Text('📅 Keep your availability updated'),
            const SizedBox(height: 8),
            const Text('🎯 Use relevant tags to improve discoverability'),
            const SizedBox(height: 8),
            const Text('💬 Ask clients for reviews after completion'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _showBulkActions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.pause),
              title: const Text('Pause All Services'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('Bulk Edit Pricing'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.schedule),
              title: const Text('Update Availability'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
// presentation/screens/provider/booking_management_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/booking.dart';
import '../../../data/models/service.dart';
import '../../../data/models/user.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/provider/booking_card.dart';
import '../../widgets/provider/booking_filter_bar.dart';

class BookingManagementScreen extends StatefulWidget {
  const BookingManagementScreen({Key? key}) : super(key: key);

  @override
  State<BookingManagementScreen> createState() => _BookingManagementScreenState();
}

class _BookingManagementScreenState extends State<BookingManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  BookingStatus? _filterStatus;
  String _sortBy = 'date_desc';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
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
              _buildQuickStats(context),
              _buildTabBar(),
              _buildFilterBar(context),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBookingsList(context, null), // All
                    _buildBookingsList(context, BookingStatus.pending),
                    _buildBookingsList(context, BookingStatus.confirmed),
                    _buildBookingsList(context, BookingStatus.inProgress),
                    _buildBookingsList(context, BookingStatus.completed),
                  ],
                ),
              ),
            ],
          );
        },
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
                      'Booking Management',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Manage your service bookings and client interactions',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () => _showCalendarView(context),
                    icon: const Icon(Icons.calendar_today, size: 18),
                    label: const Text('Calendar'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: () => _exportBookings(context),
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Export'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickStats(BuildContext context) {
    final bookings = _getDemoBookings();
    final pendingCount = bookings.where((b) => b.status == BookingStatus.pending).length;
    final todayCount = bookings.where((b) => 
      b.scheduledDateTime?.day == DateTime.now().day).length;
    final weekRevenue = bookings.where((b) => 
      b.status == BookingStatus.completed &&
      b.completedAt != null &&
      b.completedAt!.isAfter(DateTime.now().subtract(const Duration(days: 7)))
    ).fold(0.0, (sum, b) => sum + b.totalAmount);

    return Container(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Pending Requests',
                  pendingCount.toString(),
                  Icons.pending_actions,
                  Colors.orange,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'Today\'s Sessions',
                  todayCount.toString(),
                  Icons.today,
                  AppColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'This Week Revenue',
                  '\$${weekRevenue.toInt()}',
                  Icons.trending_up,
                  AppColors.success,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  'Response Rate',
                  '98%',
                  Icons.speed,
                  AppColors.info,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          gradient: LinearGradient(
            colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
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
        isScrollable: true,
        tabs: const [
          Tab(text: 'All'),
          Tab(text: 'Pending'),
          Tab(text: 'Confirmed'),
          Tab(text: 'In Progress'),
          Tab(text: 'Completed'),
        ],
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
      ),
    );
  }

  Widget _buildFilterBar(BuildContext context) {
    return BookingFilterBar(
      sortBy: _sortBy,
      onSortChanged: (sort) => setState(() => _sortBy = sort),
      onFilterChanged: (filters) {
        // Handle additional filters
      },
    );
  }

  Widget _buildBookingsList(BuildContext context, BookingStatus? status) {
    List<Booking> bookings = _getDemoBookings();
    
    if (status != null) {
      bookings = bookings.where((b) => b.status == status).toList();
    }

    // Apply sorting
    bookings.sort((a, b) {
      switch (_sortBy) {
        case 'date_asc':
          return (a.scheduledDateTime ?? a.createdAt).compareTo(b.scheduledDateTime ?? b.createdAt);
        case 'date_desc':
          return (b.scheduledDateTime ?? b.createdAt).compareTo(a.scheduledDateTime ?? a.createdAt);
        case 'amount_desc':
          return b.totalAmount.compareTo(a.totalAmount);
        case 'amount_asc':
          return a.totalAmount.compareTo(b.totalAmount);
        default:
          return 0;
      }
    });

    if (bookings.isEmpty) {
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
                    '${bookings.length} ${status?.name.toUpperCase() ?? 'TOTAL'} Bookings',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  if (status == BookingStatus.pending)
                    TextButton.icon(
                      onPressed: () => _acceptAllPending(context),
                      icon: const Icon(Icons.check_circle, size: 16),
                      label: const Text('Accept All'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.success,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              ...bookings.map((booking) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: BookingCard(
                  booking: booking,
                  onAccept: () => _handleBookingAction(context, booking, 'accept'),
                  onDecline: () => _handleBookingAction(context, booking, 'decline'),
                  onMessage: () => _handleBookingAction(context, booking, 'message'),
                  onComplete: () => _handleBookingAction(context, booking, 'complete'),
                  onViewDetails: () => _viewBookingDetails(context, booking),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, BookingStatus? status) {
    String title, subtitle;
    IconData icon;

    switch (status) {
      case BookingStatus.pending:
        icon = Icons.pending_actions;
        title = 'No Pending Requests';
        subtitle = 'New booking requests will appear here for your review.';
        break;
      case BookingStatus.confirmed:
        icon = Icons.event_available;
        title = 'No Confirmed Bookings';
        subtitle = 'Accepted bookings waiting to start will appear here.';
        break;
      case BookingStatus.inProgress:
        icon = Icons.work;
        title = 'No Active Sessions';
        subtitle = 'Ongoing service sessions will appear here.';
        break;
      case BookingStatus.completed:
        icon = Icons.check_circle;
        title = 'No Completed Bookings';
        subtitle = 'Finished services will appear here.';
        break;
      default:
        icon = Icons.book_online;
        title = 'No Bookings Yet';
        subtitle = 'Your service bookings will appear here once students start booking.';
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
          ],
        ),
      ),
    );
  }

  List<Booking> _getDemoBookings() {
    return [
      Booking(
        id: '1',
        serviceId: 'service1',
        providerId: 'current_user',
        clientId: 'client1',
        status: BookingStatus.pending,
        paymentStatus: PaymentStatus.pending,
        totalAmount: 75.0,
        scheduledDateTime: DateTime.now().add(const Duration(days: 2)),
        requirements: BookingRequirements(
          resume: 'cv.pdf',
          specialInstructions: 'Focus on technical interview questions for PhD programs.',
        ),
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
        payment: BookingPayment(
          transactionId: 'txn_123',
          paymentMethod: 'card',
          subtotal: 75.0,
          platformFee: 5.25,
          processingFee: 2.25,
          total: 82.50,
        ),
      ),
      Booking(
        id: '2',
        serviceId: 'service2',
        providerId: 'current_user',
        clientId: 'client2',
        status: BookingStatus.confirmed,
        paymentStatus: PaymentStatus.captured,
        totalAmount: 45.0,
        scheduledDateTime: DateTime.now().add(const Duration(days: 1)),
        requirements: BookingRequirements(
          resume: 'resume.pdf',
          coverLetter: 'cover_letter.pdf',
        ),
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 1)),
        payment: BookingPayment(
          transactionId: 'txn_124',
          paymentMethod: 'card',
          subtotal: 45.0,
          platformFee: 3.15,
          processingFee: 1.35,
          total: 49.50,
        ),
      ),
      Booking(
        id: '3',
        serviceId: 'service1',
        providerId: 'current_user',
        clientId: 'client3',
        status: BookingStatus.completed,
        paymentStatus: PaymentStatus.captured,
        totalAmount: 75.0,
        scheduledDateTime: DateTime.now().subtract(const Duration(days: 2)),
        completedAt: DateTime.now().subtract(const Duration(days: 1)),
        requirements: BookingRequirements(),
        deliverables: [
          BookingDeliverable(
            id: 'del1',
            title: 'Interview Feedback Report',
            fileUrl: 'feedback.pdf',
            fileType: 'pdf',
            fileSizeBytes: 245760,
            deliveredAt: DateTime.now().subtract(const Duration(days: 1)),
          ),
        ],
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
        payment: BookingPayment(
          transactionId: 'txn_125',
          paymentMethod: 'card',
          subtotal: 75.0,
          platformFee: 5.25,
          processingFee: 2.25,
          total: 82.50,
        ),
      ),
    ];
  }

  void _handleBookingAction(BuildContext context, Booking booking, String action) {
    switch (action) {
      case 'accept':
        _showConfirmDialog(
          context,
          'Accept Booking',
          'Accept this booking request from the client?',
          () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Booking accepted'),
                backgroundColor: AppColors.success,
              ),
            );
          },
        );
        break;
      case 'decline':
        _showDeclineDialog(context, booking);
        break;
      case 'message':
        Navigator.pushNamed(
          context,
          '/booking-chat',
          arguments: booking,
        );
        break;
      case 'complete':
        _showCompleteDialog(context, booking);
        break;
    }
  }

  void _showConfirmDialog(BuildContext context, String title, String message, VoidCallback onConfirm) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              onConfirm();
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  void _showDeclineDialog(BuildContext context, Booking booking) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Decline Booking'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for declining this booking:'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Optional reason...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Booking declined'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Decline'),
          ),
        ],
      ),
    );
  }

  void _showCompleteDialog(BuildContext context, Booking booking) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Complete Booking'),
        content: const Text('Mark this booking as completed? This will finalize the payment and allow the client to leave a review.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Booking completed'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Complete'),
          ),
        ],
      ),
    );
  }

  void _viewBookingDetails(BuildContext context, Booking booking) {
    Navigator.pushNamed(
      context,
      '/booking-details',
      arguments: booking,
    );
  }

  void _showCalendarView(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calendar view coming soon')),
    );
  }

  void _exportBookings(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Export functionality coming soon')),
    );
  }

  void _acceptAllPending(BuildContext context) {
    _showConfirmDialog(
      context,
      'Accept All Pending',
      'Accept all pending booking requests?',
      () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('All pending bookings accepted'),
            backgroundColor: AppColors.success,
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
// core/router/go_router_config.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/lab_detail/lab_detail_screen.dart';
import '../../presentation/screens/search/search_screen.dart';
import '../../presentation/screens/reviews/write_review_screen.dart';
import '../../presentation/screens/reviews/reviews_browse_screen.dart';
import '../../presentation/screens/reviews/review_detail_screen.dart';
import '../../presentation/screens/auth/sign_in_screen.dart';
import '../../presentation/screens/auth/sign_up_screen.dart';
import '../../presentation/screens/auth/email_verification_screen.dart';
import '../../presentation/screens/auth/verify_email_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/profile/my_reviews_screen.dart';
import '../../presentation/screens/services/application_services_screen.dart';
import '../../presentation/screens/services/cv_review_screen.dart';
import '../../presentation/screens/services/mock_interview_screen.dart';
import '../../presentation/screens/services/mentorship_marketplace_screen.dart';
import '../../presentation/screens/services/timeline_manager_screen.dart';
import '../../presentation/screens/marketplace/marketplace_screen.dart';
import '../../presentation/screens/provider/provider_dashboard_screen.dart';
import '../../presentation/screens/provider/my_services_screen.dart';
import '../../presentation/screens/provider/booking_management_screen.dart';
import '../../presentation/screens/provider/earnings_screen.dart';
import '../../data/models/lab.dart';
import '../../data/models/review.dart';
import '../../services/lab_service.dart';
import '../../services/review_service.dart';
import '../../presentation/widgets/common/header_navigation.dart';

class GoRouterConfig {
  static Page<dynamic> _buildPageWithoutTransition({
    required Widget child,
    required GoRouterState state,
  }) {
    if (kIsWeb) {
      return NoTransitionPage(
        key: state.pageKey,
        child: child,
      );
    }
    return MaterialPage(
      key: state.pageKey,
      child: child,
    );
  }

  static final GoRouter router = GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    routes: [
      // Home
      GoRoute(
        path: '/',
        name: 'home',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const HomeScreen(),
          state: state,
        ),
      ),

      // Search
      GoRoute(
        path: '/search',
        name: 'search',
        pageBuilder: (context, state) {
          final query = state.uri.queryParameters['q'];
          return _buildPageWithoutTransition(
            child: SearchScreen(initialQuery: query),
            state: state,
          );
        },
      ),

      // Lab Detail
      GoRoute(
        path: '/lab/:labSlug',
        name: 'lab-detail',
        pageBuilder: (context, state) {
          final labSlug = state.pathParameters['labSlug']!;
          final labName = Lab.getNameFromSlug(labSlug);
          return _buildPageWithoutTransition(
            child: FutureBuilder<Lab?>(
              future: LabService.getLabByName(labName),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Scaffold(
                    appBar: HeaderNavigation(),
                    body: Center(child: CircularProgressIndicator()),
                  );
                }

                if (snapshot.hasError || !snapshot.hasData) {
                  return Scaffold(
                    appBar: const HeaderNavigation(),
                    body: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 64),
                          const SizedBox(height: 16),
                          Text('Lab not found'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => context.go('/'),
                            child: const Text('Go Home'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return LabDetailScreen(lab: snapshot.data!);
              },
            ),
            state: state,
          );
        },
      ),


      // Write Review
      GoRoute(
        path: '/write-review',
        name: 'write-review',
        pageBuilder: (context, state) {
          final labId = state.uri.queryParameters['lab'];
          return _buildPageWithoutTransition(
            child: WriteReviewScreen(labId: labId),
            state: state,
          );
        },
      ),

      // Browse Reviews
      GoRoute(
        path: '/reviews',
        name: 'browse-reviews',
        pageBuilder: (context, state) {
          final query = state.uri.queryParameters['q'];
          final labId = state.uri.queryParameters['lab'];
          return _buildPageWithoutTransition(
            child: ReviewsBrowseScreen(
              initialQuery: query,
              initialLabId: labId,
            ),
            state: state,
          );
        },
      ),

      // Review Detail
      GoRoute(
        path: '/reviews/:reviewId',
        name: 'review-detail',
        pageBuilder: (context, state) {
          final reviewId = state.pathParameters['reviewId']!;
          return _buildPageWithoutTransition(
            child: FutureBuilder<Review?>(
              future: ReviewService.getReviewById(reviewId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Scaffold(
                    appBar: HeaderNavigation(),
                    body: Center(child: CircularProgressIndicator()),
                  );
                }

                if (snapshot.hasError || !snapshot.hasData) {
                  return Scaffold(
                    appBar: const HeaderNavigation(),
                    body: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 64),
                          const SizedBox(height: 16),
                          Text('Review not found'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => context.go('/reviews'),
                            child: const Text('Browse Reviews'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return ReviewDetailScreen(review: snapshot.data!);
              },
            ),
            state: state,
          );
        },
      ),

      // Authentication Routes
      GoRoute(
        path: '/sign-in',
        name: 'sign-in',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const SignInScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/sign-up',
        name: 'sign-up',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const SignUpScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/email-verification',
        name: 'email-verification',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const EmailVerificationScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/verify-email/:token',
        name: 'verify-email',
        pageBuilder: (context, state) {
          final token = state.pathParameters['token'] ?? '';
          return _buildPageWithoutTransition(
            child: VerifyEmailScreen(token: token),
            state: state,
          );
        },
      ),

      // Profile Routes
      GoRoute(
        path: '/profile',
        name: 'profile',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const ProfileScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/profile/my-reviews',
        name: 'my-reviews',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const MyReviewsScreen(),
          state: state,
        ),
      ),

      // Service Routes
      GoRoute(
        path: '/services',
        name: 'application-services',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const ApplicationServicesScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/services/cv-review',
        name: 'cv-review',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const CVReviewScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/services/mock-interview',
        name: 'mock-interview',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const MockInterviewScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/services/timeline-manager',
        name: 'timeline-manager',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const TimelineManagerScreen(),
          state: state,
        ),
      ),

      GoRoute(
        path: '/services/mentorship',
        name: 'mentorship-marketplace',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const MentorshipMarketplaceScreen(),
          state: state,
        ),
      ),

      // Marketplace
      GoRoute(
        path: '/marketplace',
        name: 'marketplace',
        pageBuilder: (context, state) => _buildPageWithoutTransition(
          child: const MarketplaceScreen(),
          state: state,
        ),
      ),

      // Provider Routes
      GoRoute(
        path: '/provider/dashboard',
        name: 'provider-dashboard',
        builder: (context, state) => const ProviderDashboardScreen(),
      ),

      GoRoute(
        path: '/provider/services',
        name: 'my-services',
        builder: (context, state) => const MyServicesScreen(),
      ),

      GoRoute(
        path: '/provider/bookings',
        name: 'booking-management',
        builder: (context, state) => const BookingManagementScreen(),
      ),

      GoRoute(
        path: '/provider/earnings',
        name: 'earnings',
        builder: (context, state) => const EarningsScreen(),
      ),

      // Coming Soon Routes
      GoRoute(
        path: '/services/sop-editing',
        name: 'sop-editing',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.construction, size: 64),
                SizedBox(height: 16),
                Text(
                  'SOP Editing Service',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text('Coming Soon!'),
              ],
            ),
          ),
        ),
      ),
    ],

    // Error handling
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64),
            const SizedBox(height: 16),
            Text(
              'Page Not Found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text('The page "${state.matchedLocation}" could not be found.'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
}
// core/router/app_routes.dart
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

/// App routes and navigation utilities
class AppRoutes {
  // Route paths
  static const String home = '/';
  static const String search = '/search';
  static const String writeReview = '/write-review';
  static const String browseReviews = '/reviews';
  static const String signIn = '/sign-in';
  static const String signUp = '/sign-up';
  static const String profile = '/profile';
  static const String myReviews = '/profile/my-reviews';
  static const String services = '/services';
  static const String cvReview = '/services/cv-review';
  static const String mockInterview = '/services/mock-interview';
  static const String timelineManager = '/services/timeline-manager';
  static const String mentorship = '/services/mentorship';
  static const String marketplace = '/marketplace';
  static const String providerDashboard = '/provider/dashboard';
  static const String myServices = '/provider/services';
  static const String bookings = '/provider/bookings';
  static const String earnings = '/provider/earnings';

  // Navigation helpers
  static void goHome(BuildContext context) => context.go(home);

  static void goToSearch(BuildContext context, {String? query}) {
    if (query != null && query.isNotEmpty) {
      context.go('$search?q=${Uri.encodeComponent(query)}');
    } else {
      context.go(search);
    }
  }

  static void goToLab(BuildContext context, String labSlug) {
    context.go('/lab/$labSlug');
  }

  static void goToLabByName(BuildContext context, String labName) {
    final slug = labName.toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s]'), '')
        .replaceAll(RegExp(r'\s+'), '-');
    context.go('/lab/$slug');
  }

  static void goToAllPublications(BuildContext context, String labId, {String? labName}) {
    context.go('/lab/$labId/publications');
  }

  static void goToReview(BuildContext context, String reviewId) {
    context.go('/reviews/$reviewId');
  }

  static void goToWriteReview(BuildContext context, {String? labId}) {
    if (labId != null) {
      context.go('$writeReview?lab=$labId');
    } else {
      context.go(writeReview);
    }
  }

  static void goToProfile(BuildContext context) => context.go(profile);

  static void goToSignIn(BuildContext context) => context.go(signIn);

  static void goToSignUp(BuildContext context) => context.go(signUp);

  static void goToService(BuildContext context, String service) {
    switch (service.toLowerCase()) {
      case 'cv':
      case 'cv-review':
        context.go(cvReview);
        break;
      case 'interview':
      case 'mock-interview':
        context.go(mockInterview);
        break;
      case 'timeline':
      case 'timeline-manager':
        context.go(timelineManager);
        break;
      case 'mentorship':
        context.go(mentorship);
        break;
      default:
        context.go(services);
    }
  }

  // Email verification without exposing user info in URL
  static void goToEmailVerification(BuildContext context, {String? message}) {
    // Don't expose email or userId in URL for security
    context.go('/email-verification');
  }

  static void goToVerifyEmail(BuildContext context, String token) {
    context.go('/verify-email/$token');
  }

  // Check if current route matches
  static bool isCurrentRoute(BuildContext context, String route) {
    final currentRoute = GoRouterState.of(context).matchedLocation;
    return currentRoute == route;
  }

  // Get current route
  static String getCurrentRoute(BuildContext context) {
    return GoRouterState.of(context).matchedLocation;
  }

  // Get query parameter
  static String? getQueryParameter(BuildContext context, String key) {
    return GoRouterState.of(context).uri.queryParameters[key];
  }

  // Get path parameter
  static String? getPathParameter(BuildContext context, String key) {
    return GoRouterState.of(context).pathParameters[key];
  }
}
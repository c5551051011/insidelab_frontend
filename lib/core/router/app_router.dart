// core/router/app_router.dart
import 'package:flutter/material.dart';
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/lab_detail/lab_detail_screen.dart';
import '../../presentation/screens/search/search_screen.dart';
import '../../presentation/screens/write_review/write_review_screen.dart';
import '../../presentation/screens/auth/sign_in_screen.dart';
import '../../presentation/screens/auth/sign_up_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/profile/my_reviews_screen.dart';
import '../../presentation/screens/services/application_services_screen.dart';
import '../../presentation/screens/services/cv_review_screen.dart';
import '../../presentation/screens/services/mock_interview_screen.dart';
import '../../presentation/screens/services/mentorship_marketplace_screen.dart';
import '../../presentation/screens/services/timeline_manager_screen.dart';
import '../../data/models/lab.dart';

class AppRouter {
  static const String home = '/';
  static const String labDetail = '/lab-detail';
  static const String search = '/search';
  static const String writeReview = '/write-review';
  static const String signIn = '/sign-in';
  static const String signUp = '/sign-up';
  static const String profile = '/profile';
  static const String myReviews = '/my-reviews';
  static const String applicationServices = '/application-services';
  static const String cvReview = '/cv-review';
  static const String sopEditing = '/sop-editing';
  static const String mockInterview = '/mock-interview';
  static const String timelineManager = '/timeline-manager';
  static const String mentorshipMarketplace = '/mentorship-marketplace';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return MaterialPageRoute(
          builder: (_) => const HomeScreen(),
        );

      case labDetail:
        final lab = settings.arguments as Lab;
        return MaterialPageRoute(
          builder: (_) => LabDetailScreen(lab: lab),
        );

      case search:
        final query = settings.arguments as String?;
        return MaterialPageRoute(
          builder: (_) => SearchScreen(initialQuery: query),
        );

      case writeReview:
        final lab = settings.arguments as Lab;
        return MaterialPageRoute(
          builder: (_) => WriteReviewScreen(lab: lab),
        );

      case signIn:
        return MaterialPageRoute(
          builder: (_) => const SignInScreen(),
        );

      case signUp:
        return MaterialPageRoute(
          builder: (_) => const SignUpScreen(),
        );

      case profile:
        return MaterialPageRoute(
          builder: (_) => const ProfileScreen(),
        );

      case myReviews:
        return MaterialPageRoute(
          builder: (_) => const MyReviewsScreen(),
        );

      case applicationServices:
        return MaterialPageRoute(
          builder: (_) => const ApplicationServicesScreen(),
        );

      case cvReview:
        return MaterialPageRoute(
          builder: (_) => const CVReviewScreen(),
        );

      case mockInterview:
        return MaterialPageRoute(
          builder: (_) => const MockInterviewScreen(),
        );

      case timelineManager:
        return MaterialPageRoute(
          builder: (_) => const TimelineManagerScreen(),
        );

      case mentorshipMarketplace:
        return MaterialPageRoute(
          builder: (_) => const MentorshipMarketplaceScreen(),
        );

      case sopEditing:
        return MaterialPageRoute(
          builder: (_) => const Scaffold(
            body: Center(
              child: Text('SOP Editing - Coming Soon!'),
            ),
          ),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
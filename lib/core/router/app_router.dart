// core/router/app_router.dart
import 'package:flutter/material.dart';
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/lab_detail/lab_detail_screen.dart';
import '../../presentation/screens/search/search_screen.dart';
import '../../presentation/screens/write_review/write_review_screen.dart';
import '../../presentation/screens/auth/sign_in_screen.dart';
import '../../presentation/screens/auth/sign_up_screen.dart';
import '../../data/models/lab.dart';

class AppRouter {
  static const String home = '/';
  static const String labDetail = '/lab-detail';
  static const String search = '/search';
  static const String writeReview = '/write-review';
  static const String signIn = '/sign-in';
  static const String signUp = '/sign-up';

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
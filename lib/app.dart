// app.dart - Updated with Provider setup and GoRouter
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/router/go_router_config.dart';
import 'data/providers/data_providers.dart';
import 'data/providers/data_cache_provider.dart';
import 'data/providers/saved_labs_provider.dart';
import 'data/repositories/lab_repository.dart';
import 'data/repositories/review_repository.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';

class InsideLabApp extends StatelessWidget {
  const InsideLabApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<LabRepository>(
          create: (_) => LabRepositoryImpl(),
        ),
        Provider<ReviewRepository>(
          create: (_) => ReviewRepositoryImpl(),
        ),
        ChangeNotifierProvider<LabProvider>(
          create: (context) => LabProvider(
            context.read<LabRepository>(),
          ),
        ),
        ChangeNotifierProvider<ReviewProvider>(
          create: (context) => ReviewProvider(
            context.read<ReviewRepository>(),
          ),
        ),
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
        ),
        ChangeNotifierProvider<DataCacheProvider>(
          create: (_) => DataCacheProvider(),
        ),
        ChangeNotifierProvider<SavedLabsProvider>(
          create: (_) => SavedLabsProvider(),
        ),
      ],
      child: MaterialApp.router(
        title: 'InsideLab - Graduate School Lab Reviews',
        theme: kIsWeb
            ? AppTheme.lightTheme.copyWith(
                pageTransitionsTheme: const PageTransitionsTheme(
                  builders: {
                    TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
                    TargetPlatform.iOS: FadeUpwardsPageTransitionsBuilder(),
                    TargetPlatform.linux: FadeUpwardsPageTransitionsBuilder(),
                    TargetPlatform.macOS: FadeUpwardsPageTransitionsBuilder(),
                    TargetPlatform.windows: FadeUpwardsPageTransitionsBuilder(),
                  },
                ),
              )
            : AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        routerConfig: GoRouterConfig.router,
      ),
    );
  }
}
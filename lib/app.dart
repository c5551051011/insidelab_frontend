// app.dart - Updated with Provider setup
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'data/providers/data_providers.dart';
import 'data/repositories/lab_repository.dart';
import 'data/repositories/review_repository.dart';

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
      ],
      child: MaterialApp(
        title: 'InsideLab - Graduate School Lab Reviews',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        onGenerateRoute: AppRouter.generateRoute,
        initialRoute: AppRouter.home,
      ),
    );
  }
}
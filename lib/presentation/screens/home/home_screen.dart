// presentation/screens/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../widgets/common/header_navigation.dart';
import '../../widgets/common/footer.dart';
import '../../widgets/common/role_switcher.dart';
import '../../widgets/sections/hero_section.dart';
import '../../widgets/sections/trusted_metrics_section.dart';
import '../../widgets/sections/services_section.dart';
import '../../widgets/sections/testimonials_section.dart';
import '../../widgets/sections/cta_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const HeroSection(),
            const TrustedMetricsSection(),
            const ServicesSection(),
            const TestimonialsSection(),
            const CtaSection(),
            const Footer(),
          ],
        ),
      ),
    );
  }
}


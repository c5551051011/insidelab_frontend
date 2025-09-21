// core/constants/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors (Updated to UI Spec)
  static const Color primary = Color(0xFF2563EB);        // Main Blue
  static const Color primaryDark = Color(0xFF1E3A8A);    // Deep Blue (Header text/icons)
  static const Color primaryLight = Color(0xFF60A5FA);   // Light blue for footer links
  static const Color primaryHover = Color(0xFF1D4ED8);   // Primary button hover
  
  // Secondary Colors (Updated to UI Spec)
  static const Color secondary = Color(0xFF7C3AED);      // Accent Purple (CTA gradient)
  static const Color secondaryDark = Color(0xFF6D28D9);
  static const Color secondaryLight = Color(0xFFA78BFA);

  // Neutral Colors (Updated to UI Spec)
  static const Color background = Color(0xFFFFFFFF);     // Card background
  static const Color backgroundLight = Color(0xFFF8FAFC); // Light background
  static const Color surface = Color(0xFFFFFFFF);        // White surface
  static const Color textPrimary = Color(0xFF1F2937);    // Softer dark text (was too black)
  static const Color textSecondary = Color(0xFF6B7280);  // Medium gray text
  static const Color textTertiary = Color(0xFF9CA3AF);   // Light gray text

  // Footer Colors (Updated to UI Spec)
  static const Color footerBackground = Color(0xFF0B1220); // Footer background
  static const Color footerText = Color(0xFF94A3B8);       // Footer text
  static const Color footerLink = Color(0xFF60A5FA);       // Footer links

  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Rating Color
  static const Color rating = Color(0xFFFBBF24);

  // Border & Divider (Updated to UI Spec)
  static const Color border = Color(0xFFE2E8F0);         // Border color
  static const Color divider = Color(0xFFE2E8F0);

  // Hero section colors
  static const Color heroText = Color(0xFFFFFFFF);
  static const Color heroSubtext = Color(0xFFE2E8F0);

  // Trusted metrics section
  static const Color metricsBackground = Color(0xFF2563EB);
  static const Color metricsText = Color(0xFFFFFFFF);
  static const Color metricsSubtext = Color(0xFFE2E8F0);

  // Button Colors
  static const Color buttonPrimary = Color(0xFF2563EB);
  static const Color buttonPrimaryHover = Color(0xFF1D4ED8);
  static const Color buttonSecondary = Colors.transparent;
  static const Color buttonText = Color(0xFFFFFFFF);

  // Gradient Colors (Updated to UI Spec)
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryDark],
  );
  
  static const LinearGradient heroOverlay = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color.fromRGBO(37, 99, 235, 0.78), // Blue overlay for hero
      Color.fromRGBO(37, 99, 235, 0.78),
    ],
  );
  
  static const LinearGradient ctaGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF7C3AED), // Purple start
      Color(0xFF2563EB), // Blue end
    ],
  );

  // Shadow (Updated to UI Spec)
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color.fromRGBO(2, 6, 23, 0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];
  
  static List<BoxShadow> cardShadowNarrow = [
    BoxShadow(
      color: Color.fromRGBO(2, 6, 23, 0.06),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> cardShadowHover = [
    BoxShadow(
      color: Color.fromRGBO(2, 6, 23, 0.12),
      blurRadius: 28,
      offset: const Offset(0, 12),
    ),
  ];

  static List<BoxShadow> elevatedShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      blurRadius: 20,
      offset: const Offset(0, 10),
    ),
  ];
}

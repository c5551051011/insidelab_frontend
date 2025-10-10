// Flutter AppColors와 동일한 색상 시스템
export const colors = {
  // Primary Colors (Flutter와 동일)
  primary: '#2563EB',        // Main Blue
  primaryDark: '#1E3A8A',    // Deep Blue (Header text/icons)
  primaryLight: '#60A5FA',   // Light blue for footer links
  primaryHover: '#1D4ED8',   // Primary button hover

  // Secondary Colors (Flutter와 동일)
  secondary: '#7C3AED',      // Accent Purple (CTA gradient)
  secondaryDark: '#6D28D9',
  secondaryLight: '#A78BFA',

  // Neutral Colors (Flutter와 동일)
  background: '#FFFFFF',     // Card background
  backgroundLight: '#F8FAFC', // Light background
  surface: '#FFFFFF',        // White surface
  textPrimary: '#1F2937',    // Softer dark text
  textSecondary: '#6B7280',  // Medium gray text
  textTertiary: '#9CA3AF',   // Light gray text

  // Footer Colors (Flutter와 동일)
  footerBackground: '#0B1220', // Footer background
  footerText: '#94A3B8',       // Footer text
  footerLink: '#60A5FA',       // Footer links

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Rating Color
  rating: '#FBBF24',

  // Border & Divider (Flutter와 동일)
  border: '#E2E8F0',         // Border color
  divider: '#E2E8F0',

  // Hero section colors
  heroText: '#FFFFFF',
  heroSubtext: '#E2E8F0',

  // Trusted metrics section
  metricsBackground: '#2563EB',
  metricsText: '#FFFFFF',
  metricsSubtext: '#E2E8F0',

  // Button Colors
  buttonPrimary: '#2563EB',
  buttonPrimaryHover: '#1D4ED8',
  buttonSecondary: 'transparent',
  buttonText: '#FFFFFF',
};

// CSS Gradients (Flutter와 동일)
export const gradients = {
  primaryGradient: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',

  heroOverlay: 'linear-gradient(135deg, rgba(37, 99, 235, 0.78) 0%, rgba(37, 99, 235, 0.78) 100%)',

  ctaGradient: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
};

// Box Shadows (Flutter와 동일)
export const shadows = {
  cardShadow: '0 8px 24px rgba(2, 6, 23, 0.08)',
  cardShadowNarrow: '0 4px 12px rgba(2, 6, 23, 0.06)',
  cardShadowHover: '0 12px 28px rgba(2, 6, 23, 0.12)',
  elevatedShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
};
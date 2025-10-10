// Flutter와 동일한 타이포그래피 시스템
export const typography = {
  // 기본 폰트
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',

  // Font Sizes (Flutter와 동일)
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '56px',
  },

  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeights: {
    none: 1,
    tight: 1.1,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em',
  },
};

// 재사용 가능한 텍스트 스타일 (Flutter TextStyle과 유사)
export const textStyles = {
  // Hero Section
  heroTitle: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.extrabold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tighter,
    fontFamily: typography.fontFamily,
  },

  heroTitleMobile: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.extrabold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tighter,
    fontFamily: typography.fontFamily,
  },

  heroSubtitle: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.relaxed,
    fontFamily: typography.fontFamily,
  },

  heroSubtitleMobile: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.relaxed,
    fontFamily: typography.fontFamily,
  },

  // Section Headers
  sectionTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.extrabold,
    fontFamily: typography.fontFamily,
  },

  sectionTitleMobile: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.extrabold,
    fontFamily: typography.fontFamily,
  },

  sectionSubtitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily,
  },

  // Cards
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
  },

  cardDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
    fontFamily: typography.fontFamily,
  },

  // Metrics
  metricNumber: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.extrabold,
    fontFamily: typography.fontFamily,
  },

  metricLabel: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
  },

  // Buttons
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },

  buttonTextSmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
};
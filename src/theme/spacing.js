// Flutter와 동일한 스페이싱 시스템
export const spacing = {
  // 기본 스페이싱 (4px 단위)
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// 섹션별 스페이싱 (Flutter와 동일)
export const sectionSpacing = {
  // 세로 패딩
  mobile: {
    small: spacing[14],    // 56px
    medium: spacing[20],   // 80px
    large: spacing[24],    // 96px
  },
  desktop: {
    small: spacing[18],    // 72px
    medium: spacing[24],   // 96px
    large: spacing[32],    // 128px
  },

  // 가로 패딩
  horizontal: {
    mobile: spacing[6],    // 24px
    desktop: spacing[12],  // 48px
  },

  // 컨테이너 간격
  between: {
    mobile: spacing[10],   // 40px
    desktop: spacing[16],  // 64px
  },
};

// Border Radius (Flutter와 동일)
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
};
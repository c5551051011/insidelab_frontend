// 모든 테마 관련 export를 모음
export { colors, gradients, shadows } from './colors';
export { typography, textStyles } from './typography';
export { spacing, sectionSpacing, borderRadius } from './spacing';

// Breakpoints (Flutter와 동일)
export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
};

// Media Queries Helper
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.tablet})`,
  desktopLarge: `@media (min-width: ${breakpoints.desktop})`,
};
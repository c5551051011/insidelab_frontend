import { useCallback, useEffect, useState } from 'react';

const defaultBreakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const getInitialWidth = (fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return window.innerWidth;
};

export const useBreakpoint = (overrides = {}) => {
  const breakpoints = { ...defaultBreakpoints, ...overrides };
  const [width, setWidth] = useState(() => getInitialWidth(breakpoints.lg));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBelow = useCallback((value) => width < value, [width]);
  const isAbove = useCallback((value) => width >= value, [width]);

  return {
    width,
    breakpoints,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    isLargeDesktop: width >= breakpoints.xl,
    isBelow,
    isAbove,
  };
};

export const useMediaQuery = (query) => {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const updateMatch = (event) => setMatches(event.matches);

    // Deprecated browsers still use addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatch);
      return () => mediaQuery.removeEventListener('change', updateMatch);
    }

    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, [query]);

  return matches;
};

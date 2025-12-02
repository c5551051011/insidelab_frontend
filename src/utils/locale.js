export const isKoreanPath = (pathname = '') => pathname.startsWith('/kr');

const stripKrPrefix = (pathname = '') => pathname.replace(/^\/kr(?=\/|$)/, '') || '/';
const addKrPrefix = (pathname = '') => {
  if (pathname === '/kr') return '/kr';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalized === '/' ? '/kr' : `/kr${normalized}`;
};

export const getLangFromPath = (pathname = '') => (isKoreanPath(pathname) ? 'ko' : 'en');

export const buildLocalizedPath = (pathname = '/', lang = 'en') => {
  if (lang === 'ko') {
    return addKrPrefix(pathname);
  }
  return stripKrPrefix(pathname);
};

export const toggleLocalePath = (pathname = '/', targetLang = 'en') => {
  return buildLocalizedPath(pathname, targetLang);
};

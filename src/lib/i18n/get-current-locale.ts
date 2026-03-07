export function getCurrentLocale(): 'en' | 'ar' {
  if (typeof document === 'undefined') return 'en';

  const lang = document.documentElement.lang;
  return lang === 'ar' ? 'ar' : 'en';
}

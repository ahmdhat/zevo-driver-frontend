import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'ar'] as const;
type AppLocale = (typeof locales)[number];

function isAppLocale(value: unknown): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export default getRequestConfig(async ({locale}) => {
  const safeLocale: AppLocale = isAppLocale(locale) ? locale : 'en';

  return {
    locale: safeLocale,
    messages: (await import(`../../messages/${safeLocale}.json`)).default
  };
});

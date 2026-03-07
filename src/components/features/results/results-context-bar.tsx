'use client';

import { useTranslations } from 'next-intl';

import { PageHero } from '@/components/ui/page-hero';

export function ResultsContextBar({
  locale,
}: {
  locale: string;
}) {
  const t = useTranslations();

  return (
    <PageHero
      backLink={`/${locale}/explore`}
      backLabel={t('common.modifySearch')}
      label={t('results.eyebrow')}
      title={t('results.title')}
      subtitle={t('results.subtitle')}
    />
  );
}

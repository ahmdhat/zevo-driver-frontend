'use client';

import { useTranslations } from 'next-intl';
import { Car } from 'lucide-react';

import { SectionLabel } from '@/components/ui/section-label';

export function DriverFooter() {
  const t = useTranslations();

  return (
    <footer className="bg-white border-t border-border py-12 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold tracking-tighter text-foreground">
              {t('common.appName')}
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              <SectionLabel>{t('footer.privacy')}</SectionLabel>
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              <SectionLabel>{t('footer.terms')}</SectionLabel>
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              <SectionLabel>{t('footer.partner')}</SectionLabel>
            </a>
          </div>
          <SectionLabel>{t('footer.copyright')}</SectionLabel>
        </div>
      </div>
    </footer>
  );
}

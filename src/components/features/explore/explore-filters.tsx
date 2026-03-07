'use client';

import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Calendar, CornerDownLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { InputControlled } from '@/components/ui/controllers/input-controlled';
import type { ExploreSearchForm } from '@/types/explore';
import { makeExploreSearchSchema } from '@/types/explore';

export function ExploreFilters({
  defaultValues,
  onSearch,
  loading
}: {
  defaultValues: ExploreSearchForm;
  onSearch: (values: ExploreSearchForm) => void;
  loading: boolean;
}) {
  const t = useTranslations();

  const schema = useMemo(
    () =>
      makeExploreSearchSchema({
        pickupInPast: t('errors.booking.pickupInPast'),
        dropoffBeforePickup: t('errors.booking.dropoffBeforePickup'),
        minDuration: t('errors.booking.minDuration'),
      }),
    [t],
  );

  const form = useForm<ExploreSearchForm>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const fieldClass = "bg-muted border-border focus-visible:ring-ring";

  return (
    <form
      className="space-y-8"
      onSubmit={form.handleSubmit((values) => onSearch(values))}
    >
      {/* Pickup section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary" />
          <SectionLabel className="text-secondary">{t('explore.pickupDetails')}</SectionLabel>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputControlled
            control={form.control}
            name="pickupDate"
            label={t('explore.pickupDate')}
            type="date"
            className={fieldClass}
          />
          <InputControlled
            control={form.control}
            name="pickupTime"
            label={t('explore.pickupTime')}
            type="time"
            step={60}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Dropoff section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CornerDownLeft className="w-4 h-4 text-secondary" />
          <SectionLabel className="text-secondary">{t('explore.dropoffDetails')}</SectionLabel>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputControlled
            control={form.control}
            name="dropoffDate"
            label={t('explore.dropoffDate')}
            type="date"
            className={fieldClass}
          />
          <InputControlled
            control={form.control}
            name="dropoffTime"
            label={t('explore.dropoffTime')}
            type="time"
            step={60}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Search button */}
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-xs text-center font-medium italic">
          {t('explore.minBookingNotice')}
        </p>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          <Search className="w-5 h-5" />
          {t('common.search')}
        </Button>
      </div>
    </form>
  );
}

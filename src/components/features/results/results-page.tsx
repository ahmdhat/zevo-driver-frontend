'use client';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Car, Clock3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DaySelector, type DayType } from '@/components/ui/day-selector';
import { SectionLabel } from '@/components/ui/section-label';
import { Separator } from '@/components/ui/separator';
import { ShiftSelector, type ShiftType } from '@/components/ui/shift-selector';
import { useAvailableCarsByDate } from './use-available-cars-by-date';
import { ResultsContextBar } from './results-context-bar';
import { ResultsCard } from './results-card';
import { buildSearchParams, getDerivedSelection, mapCarForShift } from '@/lib/shifts';
import type { Car as CarType } from '@/types/car';

function formatRentalDuration(totalMinutes: number, t: ReturnType<typeof useTranslations>) {
  const fullDays = Math.floor(totalMinutes / (60 * 24));
  const remainingMinutes = totalMinutes % (60 * 24);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  const parts: string[] = [];
  if (fullDays > 0) {
    parts.push(`${fullDays} ${fullDays === 1 ? t('results.day') : t('results.days')}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? t('results.hour') : t('results.hours')}`);
  }
  if (minutes > 0 && fullDays === 0) {
    parts.push(`${minutes} ${minutes === 1 ? t('results.minute') : t('results.minutes')}`);
  }

  return parts.join(` ${t('results.and')} `);
}

function formatRentalPeriod(
  pickupDate: string,
  pickupTime: string,
  dropoffDate: string,
  dropoffTime: string,
  locale: string,
  durationLabel: string
) {
  if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) return '';

  const fmt = (date: string, time: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(year, month - 1, day, hours, minutes);
    return d.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return `${fmt(pickupDate, pickupTime)} – ${fmt(dropoffDate, dropoffTime)} (${durationLabel})`;
}

export function ResultsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  const pickupDate = searchParams.get('pickup_date') ?? '';
  const pickupTime = searchParams.get('pickup_time') ?? '';
  const dropoffDate = searchParams.get('dropoff_date') ?? '';
  const dropoffTime = searchParams.get('dropoff_time') ?? '';
  const { day: selectedDay, shift: selectedShift, customDate } = getDerivedSelection(
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
  );

  const router = useRouter();
  const activeShift = selectedShift ?? 'morning';

  const { data: carsByDate, isPending: loading } = useAvailableCarsByDate({ date: pickupDate });
  const cars = (carsByDate ?? [])
    .map((car) => mapCarForShift(car, activeShift))
    .filter((car): car is CarType => car !== null);

  const hasCars = !loading && cars !== undefined && cars.length > 0;
  const start = new Date(`${pickupDate}T${pickupTime}`);
  const end = new Date(`${dropoffDate}T${dropoffTime}`);
  const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
  const durationLabel = formatRentalDuration(durationMinutes, t);
  const period = formatRentalPeriod(
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    locale,
    durationLabel,
  );

  function updateRoute(next: ReturnType<typeof buildSearchParams>) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set('pickup_date', next.pickup_date);
    nextParams.set('pickup_time', next.pickup_time);
    nextParams.set('dropoff_date', next.dropoff_date);
    nextParams.set('dropoff_time', next.dropoff_time);

    router.replace(`/${locale}/results?${nextParams.toString()}`, { scroll: false });
  }

  function changeDay(day: DayType, dateOverride?: string) {
    updateRoute(buildSearchParams(day, activeShift, dateOverride));
  }

  function changeShift(shift: ShiftType) {
    updateRoute(buildSearchParams(selectedDay, shift, customDate));
  }

  return (
    <div className="page-hero-flow-bg min-h-screen">
      <ResultsContextBar locale={locale} />

      <div className="px-6 py-8 md:px-20 md:py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="surface-card flex flex-col gap-5 rounded-3xl p-5 md:p-6">
            <div className="flex flex-col gap-2">
              <SectionLabel>{t('results.rentalPeriod')}</SectionLabel>
              <p className="text-lg font-bold text-foreground md:text-xl">{period}</p>
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock3 className="size-4 text-secondary" />
                {durationLabel}
              </p>
            </div>

            <div className="space-y-3">
              <SectionLabel>{t('results.updateSummary')}</SectionLabel>
              <DaySelector
                value={selectedDay}
                customDate={customDate}
                onChange={(day, date) => changeDay(day, date)}
              />
              <ShiftSelector
                value={selectedShift}
                onChange={(shift) => changeShift(shift)}
              />
            </div>
          </div>

          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                {t('results.readyForShift')}
              </h2>
              <p className="mt-2 max-w-2xl text-base font-medium text-muted-foreground">
                {t('results.readyForShiftSubtitle')}
              </p>
            </div>
            {cars !== undefined && (
              <Badge variant="default" className="px-4 py-1.5 text-[10px]">
                <Car className="size-3.5" />
                {t('common.vehiclesAvailable', { count: cars.length })}
              </Badge>
            )}
          </section>

          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="surface-card animate-pulse rounded-3xl p-5">
                  <div className="h-6 w-28 rounded-full bg-secondary/10" />
                  <div className="mt-5 aspect-[16/11] rounded-3xl bg-secondary/10" />
                  <div className="mt-6 space-y-3">
                    <div className="h-6 w-2/3 rounded bg-secondary/10" />
                    <div className="h-4 w-full rounded bg-secondary/10" />
                    <div className="h-4 w-5/6 rounded bg-secondary/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && cars !== undefined && cars.length === 0 && (
            <Card className="rounded-3xl p-8 text-center md:p-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
                <h3 className="text-2xl font-bold text-foreground">{t('results.emptyTitle')}</h3>
                <p className="text-sm font-medium text-muted-foreground">{t('common.noVehicles')}</p>
                <Button onClick={() => router.push(`/${locale}/explore`)} className="mt-2">
                  {t('common.modifySearch')}
                </Button>
              </div>
            </Card>
          )}

          {hasCars && (
            <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {cars.map((car, index) => (
                <ResultsCard
                  key={car.id}
                  car={car}
                  priority={index}
                />
              ))}
            </section>
          )}

          {hasCars && (
            <Card className="feature-section-bg overflow-hidden border-none rounded-3xl p-8 text-white md:p-10">
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <SectionLabel className="text-white/70">{t('results.promoEyebrow')}</SectionLabel>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight">{t('results.promoTitle')}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/80">{t('results.promoDesc')}</p>
                </div>
                <Button variant="inverse" size="lg" className="w-full md:w-fit shrink-0 rounded-full">
                  {t('results.promoAction')}
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
              <Separator className="mt-8 bg-white/10" />
              <div className="mt-6 grid gap-3 text-sm font-semibold text-white/80 md:grid-cols-3">
                <div>{t('results.promoPoints.weeklyRates')}</div>
                <div>{t('results.promoPoints.prioritySupport')}</div>
                <div>{t('results.promoPoints.fastApproval')}</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

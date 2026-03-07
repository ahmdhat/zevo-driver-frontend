'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import {
  Car,
  CheckCircle,
  ArrowRight,
  MapPin,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaSlot } from '@/components/ui/media-slot';
import { SectionLabel } from '@/components/ui/section-label';
import { DaySelector, type DayType } from '@/components/ui/day-selector';
import { ShiftSelector } from '@/components/ui/shift-selector';
import { useDriverCars } from '@/components/features/results/use-driver-cars';
import { buildSearchParams, getDateForDay } from '@/lib/shifts';
import type { DriverCar } from '@/types/car';

// ─── Popular car card ─────────────────────────────────────────────────────────

function PopularCarCard({
  car,
  locale,
  searchParams,
}: {
  car: DriverCar;
  locale: string;
  searchParams: Record<string, string>;
}) {
  const t = useTranslations();
  const qs = new URLSearchParams(searchParams).toString();
  const href = `/${locale}/results/car/${car.id}${qs ? `?${qs}` : ''}`;

  return (
    <Card className="group overflow-hidden rounded-3xl p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div>
        <MediaSlot aspectRatio="3/2" className="inventory-media">
          {car.photo_path ? (
            <div
              className="absolute inset-0 bg-center bg-no-repeat bg-contain transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${car.photo_path})` }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="size-16 text-tertiary/30" />
            </div>
          )}
        </MediaSlot>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5">
        <div className="flex flex-col gap-3 sm:pt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="line-clamp-1 text-2xl font-bold text-foreground">
              {car.make} {car.model}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-1">
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-secondary/10 px-2 py-1">
              <MapPin className="size-4" />
              <span>{car.city || t('results.cityValue')}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-t border-secondary/10 pt-6">
          <div>
            <SectionLabel>{t('explore.startsFrom')}</SectionLabel>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {car.daily_rate_sar} SAR
              <span className="ml-1 text-xs font-bold text-muted-foreground">{t('common.perDay')}</span>
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto shrink-0">
            <a href={href}>
              {t('common.viewAndBook')}
              <ArrowRight className="size-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ExplorePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  const [selectedDay, setSelectedDay] = useState<DayType>('today');
  const [customDate, setCustomDate] = useState<string | undefined>();
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');

  const selectedDate = useMemo(() => getDateForDay(selectedDay, customDate), [selectedDay, customDate]);
  const searchParams = useMemo(
    () => buildSearchParams(selectedDay, selectedShift, customDate),
    [selectedDay, selectedShift, customDate],
  );

  const { data: topCars } = useDriverCars();
  const selectedDayLabel =
    selectedDay === 'custom' && customDate
      ? customDate
      : t(`explore.day.${selectedDay}`);

  function handleExplore() {
    const qs = new URLSearchParams(searchParams).toString();
    router.push(`/${locale}/results?${qs}`);
  }

  const whyCards = [
    {
      title: t('explore.whyInsuredTitle'),
      desc: t('explore.whyInsuredDesc'),
      imageSrc: '/images/why-section/fully_insured.png',
    },
    {
      title: t('explore.whyFleetTitle'),
      desc: t('explore.whyFleetDesc'),
      imageSrc: '/images/why-section/premium_fleet.png',
    },
    {
      title: t('explore.whyFlexTitle'),
      desc: t('explore.whyFlexDesc'),
      imageSrc: '/images/why-section/flexible_terms.png',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* ── Hero ── */}
      <section className="explore-hero-bg pt-16 pb-24 px-6 md:px-20 relative border-b border-secondary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 relative z-10">
          {/* Left column */}
          <div className="flex flex-col gap-10 lg:w-3/5 pt-8">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-muted text-foreground text-xs font-bold uppercase tracking-widest w-fit border border-foreground/10">
                {t('explore.builtForDrivers')}
              </div>
              <h1 className="text-foreground text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                {t('explore.heroTitle')} <br />
                <span className="text-primary">{t('explore.heroTitleAccent')}</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl">
                {t('explore.heroSubtitle')}
              </p>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-3">
              {[
                t('explore.featureChips.easyReservation'),
                t('explore.featureChips.tailoredForDrivers'),
                t('explore.featureChips.flexibleTiming'),
              ].map((chip) => (
                <div
                  key={chip}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/10 bg-white text-foreground text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {chip}
                </div>
              ))}
            </div>
          </div>

          {/* Right column — booking card */}
          <div className="lg:w-2/5 w-full rounded-4xl overflow-hidden bg-white border border-secondary/10 shadow-[0_24px_55px_rgba(6,30,41,0.1)]">
            <div className="relative p-6 md:p-9">
              <div className="mb-6">
                <h3 className="text-foreground text-[1.75rem] leading-tight font-bold">
                  {t('explore.bookingCardTitle')}
                </h3>
                <p className="text-sm text-muted-foreground font-medium mt-2 max-w-sm">
                  {t('explore.bookingCardSubtitle')}
                </p>
              </div>

              <div className="space-y-6">
                {/* Day picker */}
                <div className="space-y-2">
                  <DaySelector
                    value={selectedDay}
                    customDate={customDate}
                    onChange={(day, date) => {
                      setSelectedDay(day);
                      if (date) setCustomDate(date);
                    }}
                  />
                </div>

                {/* Shift selector */}
                <div className="bg-muted/45 border border-secondary/10 p-5 sm:p-6 rounded-3xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-4">
                    <SectionLabel>{t('explore.selectShift')}</SectionLabel>
                    <SectionLabel className="text-secondary/60">
                      {t('explore.availableLabel', { day: selectedDayLabel })}
                    </SectionLabel>
                  </div>
                  <ShiftSelector
                    value={selectedShift}
                    onChange={(val) => setSelectedShift(val)}
                  />
                </div>

                <Button
                  onClick={handleExplore}
                  size="xl"
                  className="w-full mt-4 shadow-lg shadow-secondary/15"
                >
                  {t('explore.exploreCars')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Cars ── */}
      {(topCars?.length ?? 0) > 0 && (
        <section className="explore-popular-bg py-24 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground mb-2">{t('explore.popularCarsTitle')}</h2>
                <p className="text-muted-foreground text-base font-medium">
                  {t('explore.popularCarsSubtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(topCars ?? []).map((car) => (
                <PopularCarCard
                  key={car.id}
                  car={car}
                  locale={locale}
                  searchParams={searchParams}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose ── */}
      <section
        id="why"
        className="explore-why-bg py-24 px-6 md:px-20 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t('explore.whyTitle')}</h2>
            <p className="text-white/65 text-lg font-medium">{t('explore.whySubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyCards.map(({ title, desc, imageSrc }) => (
              <div
                key={title}
                className="overflow-hidden rounded-3xl border border-white/10 hover:border-white/20 transition-all"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.06) 100%)',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.16)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="relative h-96 overflow-hidden border-b border-white/10"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06)), linear-gradient(135deg, rgba(95,149,152,0.28), rgba(29,84,109,0.16))',
                  }}
                >
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-white/55 text-base leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

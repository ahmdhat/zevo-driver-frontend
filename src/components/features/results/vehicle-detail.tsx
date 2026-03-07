'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Calendar,
  Car as CarIcon,
  CheckCircle2,
  Clock3,
  Moon,
  MoonStar,
  PhoneCall,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAvailableCarShifts } from '@/components/features/results/use-available-car-shifts';
import { useCreateBooking } from '@/components/features/results/use-create-booking';
import { OtpAuthModal } from '@/components/features/auth/otp-auth-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DaySelector, type DayType } from '@/components/ui/day-selector';
import { MediaSlot } from '@/components/ui/media-slot';
import { PageHero } from '@/components/ui/page-hero';
import { SectionLabel } from '@/components/ui/section-label';
import { Separator } from '@/components/ui/separator';
import { buildSearchParams, getAvailableShift, getDerivedSelection, getTodayDate, SHIFT_TIMES, type ShiftType } from '@/lib/shifts';
import { useAuthStore } from '@/stores/auth-store';
import { ApiException } from '@/types/api';

function toDateLabel(value: string, locale: string) {
  if (!value) return '—';

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function toTimeLabel(value: string, locale: string) {
  if (!value) return '—';

  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(2026, 0, 1, hours, minutes);

  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getShiftRangeLabel(shift: ShiftType, locale: string) {
  return `${toTimeLabel(SHIFT_TIMES[shift].pickup, locale)} - ${toTimeLabel(SHIFT_TIMES[shift].dropoff, locale)}`;
}

const SHIFT_ICONS = {
  morning: Sun,
  evening: Moon,
  night: MoonStar,
} satisfies Record<ShiftType, typeof Sun>;

function formatDuration(fullDays: number, remainingMinutes: number, t: ReturnType<typeof useTranslations>) {
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  const parts: string[] = [];

  if (fullDays > 0) {
    parts.push(`${fullDays} ${fullDays === 1 ? t('results.day') : t('results.days')}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? t('results.hour') : t('results.hours')}`);
  }

  if (mins > 0 && hours === 0) {
    parts.push(`${mins} ${mins === 1 ? t('results.minute') : t('results.minutes')}`);
  }

  return parts.join(` ${t('results.and')} `);
}

export function VehicleDetailPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const carId = typeof params?.id === 'string' ? parseInt(params.id, 10) : null;
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
  const hiddenDateRef = useRef<HTMLInputElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const fallbackShift = selectedShift ?? 'morning';

  const { data: car, isPending: loading } = useAvailableCarShifts(carId, { date: pickupDate });
  const createBookingMutation = useCreateBooking();
  const activeShift = car ? getAvailableShift(car, selectedShift) ?? car.available_shifts[0] ?? null : null;

  const updateRoute = useCallback((next: ReturnType<typeof buildSearchParams>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set('pickup_date', next.pickup_date);
    nextParams.set('pickup_time', next.pickup_time);
    nextParams.set('dropoff_date', next.dropoff_date);
    nextParams.set('dropoff_time', next.dropoff_time);

    router.replace(`/${locale}/results/car/${carId}?${nextParams.toString()}`, { scroll: false });
  }, [carId, locale, router, searchParams]);

  function openDatePicker() {
    const input = hiddenDateRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  }

  function changeDay(day: DayType, dateOverride?: string) {
    updateRoute(buildSearchParams(day, activeShift?.code ?? fallbackShift, dateOverride));
  }

  function changeShift(shift: ShiftType) {
    updateRoute(buildSearchParams(selectedDay, shift, customDate));
  }

  function handleBook() {
    const token = useAuthStore.getState().token;

    if (!token) {
      setAuthOpen(true);
      return;
    }

    if (!car || !activeShift || !activeShift.is_available) return;

    createBookingMutation.mutate(
      {
        car_id: car.id,
        pickup_date: activeShift.pickup_date,
        pickup_time: activeShift.pickup_time,
        dropoff_date: activeShift.dropoff_date,
        dropoff_time: activeShift.dropoff_time,
      },
      {
        onSuccess: (data) => {
          router.push(`/${locale}/bookings/${data.data.id}/confirmation`);
        },
        onError: (error) => {
          if (error instanceof ApiException) {
            const fieldErrors = error.error.field_errors ?? {};

            if (fieldErrors.car_id === 'errors.booking.carUnavailable') {
              toast.error(t('errors.booking.carUnavailable'));
            } else if (fieldErrors.pending_limit === 'errors.booking.pendingLimitReached') {
              toast.error(t('errors.booking.pendingLimitReached'));
            } else {
              toast.error(error.message);
            }
          } else {
            toast.error(t('common.bookingRequestFailed'));
          }
        },
      },
    );
  }

  function handleAuthed() {
    setAuthOpen(false);
    handleBook();
  }

  if (loading) {
    return (
      <div className="px-6 py-8 md:px-20">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-40 rounded-full bg-muted" />
          <div className="h-24 rounded-[2rem] bg-muted" />
          <div className="h-[28rem] rounded-[2rem] bg-muted" />
        </div>
      </div>
    );
  }

  if (!car || !activeShift) {
    return (
      <div className="px-6 py-10 md:px-20">
        <div className="mx-auto max-w-[900px] text-center">
          <p className="text-muted-foreground">{t('common.vehicleNotFound')}</p>
          <Button asChild variant="link" className="mt-4 px-0 text-secondary">
            <Link href={`/${locale}/results?${searchParams.toString()}`}>{t('common.backToResults')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const price = activeShift?.price_estimate ?? null;
  const durationLabel = price ? formatDuration(price.full_days, price.remaining_minutes, t) : '';
  const selectedShiftLabel = activeShift ? t(`explore.shift.${activeShift.code}`) : t('results.customShift');
  const shiftWord = t('results.shiftWord');
  const showUnavailableNotice = !activeShift.is_available;

  return (
    <>
      <OtpAuthModal open={authOpen} onOpenChange={setAuthOpen} onAuthed={handleAuthed} />

      <div className="page-hero-flow-bg min-h-screen text-foreground">
        <PageHero
          backLink={`/${locale}/results?${searchParams.toString()}`}
          backLabel={t('results.backToResults')}
          label={t('results.confirmEyebrow')}
          title={t('results.confirmTitle')}
          subtitle={t('results.confirmSubtitle')}
        />

        <main className="px-6 py-8 md:px-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <Card className="overflow-hidden rounded-[2rem] border-secondary/10 py-0">
              <CardContent className="p-5 md:p-6">
                <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <MediaSlot aspectRatio="16/12" className="inventory-media rounded-[1.75rem] p-4">
                    {car.photo_path ? (
                      <div
                        aria-label={`${car.make} ${car.model}`}
                        role="img"
                        className="relative z-10 h-full w-full rounded-[1.5rem] bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${car.photo_path})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CarIcon className="h-24 w-24 text-tertiary/30" />
                      </div>
                    )}
                  </MediaSlot>

                  <div className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground">
                        {car.make} {car.model} {car.year}
                      </h2>
                      <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-foreground/45">
                        {t('results.cityEconomyLabel')}
                      </p>
                    </div>

                    <p className="text-base font-medium text-muted-foreground">
                      {t('results.vehicleDetailIntro')}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="px-3 py-1.5 normal-case tracking-normal text-xs font-semibold">
                        {t('results.automatic')}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1.5 normal-case tracking-normal text-xs font-semibold">
                        {t('results.commercialInsurance')}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1.5 normal-case tracking-normal text-xs font-semibold">
                        {t('results.fastApproval')}
                      </Badge>
                    </div>

                  </div>

                  <div className="lg:col-span-2">
                    <Separator className="mb-6 bg-secondary/10" />

                    <div className="flex flex-col gap-5">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{t('results.modifyBookingTitle')}</h3>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {t('results.modifyBookingSubtitle')}
                        </p>
                      </div>

                      <input
                        ref={hiddenDateRef}
                        type="date"
                        className="sr-only"
                        min={getTodayDate(0)}
                        value={selectedDay === 'custom' ? customDate ?? '' : ''}
                        onChange={(event) => {
                          if (event.target.value) {
                            changeDay('custom', event.target.value);
                          }
                        }}
                      />

                      <DaySelector
                        value={selectedDay}
                        customDate={customDate}
                        onChange={(day, date) => changeDay(day, date)}
                      />

                      <div className="grid gap-4 md:grid-cols-3">
                        {(Object.keys(SHIFT_TIMES) as ShiftType[]).map((shift) => {
                          const shiftOption = car.available_shifts.find((item) => item.code === shift);
                          const isActive = activeShift.code === shift;
                          const isAvailable = shiftOption?.is_available ?? false;
                          const Icon = SHIFT_ICONS[shift];

                          return (
                            <button
                              key={shift}
                              type="button"
                              onClick={() => changeShift(shift)}
                              className={[
                                'rounded-[1.5rem] border bg-white p-4 text-left transition-colors',
                                isActive && isAvailable
                                  ? 'border-2 border-primary bg-muted/35'
                                  : isActive
                                    ? 'border-2 border-amber-300 bg-amber-50/70'
                                    : isAvailable
                                      ? 'border-secondary/10 hover:border-secondary/30 hover:bg-muted/20'
                                      : 'border-secondary/10 bg-muted/15 hover:border-secondary/20',
                              ].join(' ')}
                            >
                              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-primary">
                                <Icon className="size-5" />
                              </div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-bold text-foreground">
                                  {[t(`explore.shift.${shift}`), shiftWord].filter(Boolean).join(' ')}
                                </div>
                                <span className={[
                                  'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
                                  isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                                ].join(' ')}>
                                  {isAvailable ? t('results.available') : t('results.unavailable')}
                                </span>
                              </div>
                              <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                {getShiftRangeLabel(shift, locale)}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {showUnavailableNotice && (
                        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-foreground">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="text-lg font-bold">{t('results.selectionUnavailableTitle')}</h4>
                              <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
                                {selectedDay === 'today'
                                  ? t('results.todayUnavailableSubtitle')
                                  : t('results.selectionUnavailableSubtitle')}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row w-full sm:w-auto mt-4 md:mt-0 gap-3">
                              <Button type="button" className="w-full sm:w-auto" onClick={() => changeDay('tomorrow')}>
                                {t('results.tryTomorrow')}
                              </Button>
                              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={openDatePicker}>
                                <Calendar className="size-4 mr-2" />
                                {t('results.pickAnotherDay')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
              <Card className="h-full rounded-[2rem] py-0">
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <h2 className="text-2xl font-bold text-foreground">{t('results.bookingSummaryTitleSimple')}</h2>

                    <Separator className="bg-secondary/10" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">{t('results.summaryCar')}</span>
                        <span className="text-right text-sm font-bold text-foreground">
                          {car.make} {car.model} {car.year}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">{t('results.summaryShift')}</span>
                        <span className="text-right text-sm font-bold text-foreground">{selectedShiftLabel}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">{t('results.summaryPickup')}</span>
                        <span className="text-right text-sm font-bold text-foreground">
                          {toDateLabel(activeShift.pickup_date, locale)} - {toTimeLabel(activeShift.pickup_time, locale)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-muted-foreground">{t('results.summaryDropoff')}</span>
                        <span className="text-right text-sm font-bold text-foreground">
                          {toDateLabel(activeShift.dropoff_date, locale)} - {toTimeLabel(activeShift.dropoff_time, locale)}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-secondary/10" />

                    <div className="space-y-3">
                      {price!.full_days > 0 && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="size-4 text-secondary" />
                            {price!.full_days} {price!.full_days === 1 ? t('results.day') : t('results.days')}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {price!.full_days * car.daily_rate_sar} SAR
                          </span>
                        </div>
                      )}

                      {price!.remaining_minutes > 0 && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="size-4 text-secondary" />
                            {durationLabel}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {price!.capped_remaining_charge_sar} SAR
                          </span>
                        </div>
                      )}

                      {price!.remaining_minutes > 0 && price!.capped_remaining_charge_sar < price!.remaining_charge_sar && (
                        <div className="pl-6 text-xs text-muted-foreground">
                          ({t('results.uncapped')}: {price!.remaining_charge_sar} SAR)
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full rounded-[2rem] py-0">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <SectionLabel className="text-foreground/45">{t('results.nextStepsTitle')}</SectionLabel>
                      <ul className="mt-4 space-y-3">
                        {[
                          { icon: CheckCircle2, label: t('results.nextStepsItem1') },
                          { icon: PhoneCall, label: t('results.nextStepsItem2') },
                          { icon: Calendar, label: t('results.nextStepsItem3') },
                        ].map(({ icon: Icon, label }) => (
                          <li key={label} className="flex items-start gap-3 text-sm font-medium text-foreground">
                            <Icon className="mt-0.5 size-4 shrink-0 text-secondary" />
                            <span>{label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator className="bg-secondary/10" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="text-lg font-bold text-foreground">{t('results.estimatedTotal')}</p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {t('results.duration')}: {durationLabel}
                        </p>
                      </div>
                      <p className="text-2xl font-extrabold text-secondary">{price!.estimated_total_sar} SAR</p>
                    </div>

                    {showUnavailableNotice && (
                      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4 text-sm font-medium text-amber-900">
                        {selectedDay === 'today'
                          ? t('results.todayUnavailableSubtitle')
                          : t('results.selectionUnavailableSubtitle')}
                      </div>
                    )}

                    <div className="space-y-4">
                      <Button
                        onClick={handleBook}
                        disabled={createBookingMutation.isPending || showUnavailableNotice}
                        size="xl"
                        className="w-full shadow-lg shadow-secondary/15"
                      >
                        {showUnavailableNotice
                          ? t('results.shiftUnavailableAction')
                          : createBookingMutation.isPending
                            ? t('common.processing')
                            : t('results.submitBookingRequest')}
                        {!showUnavailableNotice && <ArrowRight className="size-5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

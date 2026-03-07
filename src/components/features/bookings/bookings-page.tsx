'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, Calendar, Car, ChevronRight, Clock3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/ui/page-hero';
import { SectionLabel } from '@/components/ui/section-label';
import { Separator } from '@/components/ui/separator';
import { BookingCard } from './booking-card';
import { useBookings, useCancelBooking } from './use-bookings';
import type { Booking } from '@/types/booking';

const ACTIVE_STATUSES = ['pending', 'approved', 'active'] as const;
const PAST_STATUSES = ['completed', 'cancelled'] as const;
const STATUS_GROUP_ORDER = ['approved', 'active', 'pending'] as const;

type ActiveTab = 'active' | 'past';
type ActiveStatus = typeof ACTIVE_STATUSES[number];

function formatDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function BookingsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-[1.5rem] border border-secondary/10 bg-white/80 p-5 shadow-[0_20px_45px_rgba(6,30,41,0.06)] animate-pulse"
        >
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-4 h-8 w-16 rounded bg-muted" />
          <div className="mt-2 h-3 w-28 rounded bg-muted" />
        </div>
      ))}
      {[1, 2].map((item) => (
        <div
          key={`card-${item}`}
          className="rounded-[1.75rem] border border-secondary/10 bg-white/80 p-6 shadow-[0_20px_45px_rgba(6,30,41,0.06)] md:col-span-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-7 w-48 rounded bg-muted" />
            </div>
            <div className="h-10 w-24 rounded-full bg-muted" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-20 rounded-3xl bg-muted" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-16 rounded-2xl bg-muted" />
              <div className="h-16 rounded-2xl bg-muted" />
              <div className="h-16 rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: ActiveTab }) {
  const t = useTranslations('bookings');
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  return (
    <div className="rounded-[1.75rem] border border-dashed border-secondary/15 bg-white/70 px-6 py-14 text-center shadow-[0_20px_45px_rgba(6,30,41,0.04)]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
        <Car className="size-6" />
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground">
        {tab === 'active' ? t('empty') : t('emptyPast')}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
        {tab === 'active' ? t('emptyHintActive') : t('emptyHintPast')}
      </p>
      {tab === 'active' && (
        <Button asChild className="mt-6 rounded-full px-6 font-bold">
          <Link href={`/${locale}/explore`}>{t('emptyAction')}</Link>
        </Button>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint
}: {
  icon: typeof Car;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-secondary/10 bg-white/85 p-5 shadow-[0_20px_45px_rgba(6,30,41,0.06)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel className="text-secondary/75">{label}</SectionLabel>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-5 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{hint}</p>
    </div>
  );
}

function GroupedBookings({
  bookings,
  cancelling,
  onCancel
}: {
  bookings: Booking[];
  cancelling: number | null;
  onCancel: (id: number) => void;
}) {
  const t = useTranslations('bookings');

  const grouped = STATUS_GROUP_ORDER.reduce<Record<ActiveStatus, Booking[]>>(
    (acc, status) => {
      acc[status] = bookings.filter((booking) => booking.status === status);
      return acc;
    },
    { pending: [], approved: [], active: [] }
  );

  return (
    <div className="grid gap-7">
      {STATUS_GROUP_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;

        return (
          <section key={status} className="space-y-4">
            <div className="flex items-center gap-3">
              <SectionLabel className="text-secondary/75">{t(`status.${status}`)}</SectionLabel>
              <Separator className="flex-1 bg-secondary/10" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {group.length}
              </span>
            </div>
            <div className="grid gap-5">
              {group.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={onCancel}
                  cancelling={cancelling === booking.id}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function BookingsPage() {
  const t = useTranslations('bookings');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ActiveTab>('active');
  const { data: bookings, isPending, error } = useBookings();
  const cancelMutation = useCancelBooking();

  const activeBookings = useMemo(
    () => (bookings ?? []).filter((booking) => ACTIVE_STATUSES.includes(booking.status as ActiveStatus)),
    [bookings]
  );

  const pastBookings = useMemo(
    () =>
      (bookings ?? [])
        .filter((booking) => PAST_STATUSES.includes(booking.status as (typeof PAST_STATUSES)[number]))
        .sort((a, b) => new Date(b.end_datetime).getTime() - new Date(a.end_datetime).getTime()),
    [bookings]
  );

  const nextPickup = useMemo(
    () =>
      [...activeBookings]
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
        .at(0) ?? null,
    [activeBookings]
  );

  const handleCancel = (id: number) => cancelMutation.mutate(id);
  const visibleBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="page-hero-flow-bg min-h-screen">
      <PageHero
        label={t('bookingCenter')}
        title={t('title')}
        subtitle={t('pageSubtitle')}
      >
        <Button
          variant={activeTab === 'active' ? 'pill-active' : 'pill-inactive'}
          className="px-5 py-2.5 text-sm font-bold"
          onClick={() => setActiveTab('active')}
        >
          {t('tabActive')}
        </Button>
        <Button
          variant={activeTab === 'past' ? 'pill-active' : 'pill-inactive'}
          className="px-5 py-2.5 text-sm font-bold"
          onClick={() => setActiveTab('past')}
        >
          {t('tabPast')}
        </Button>
      </PageHero>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Car}
            label={t('summaryActive')}
            value={String(activeBookings.length)}
            hint={t('summaryActiveHint')}
          />
          <SummaryCard
            icon={AlertTriangle}
            label={t('summaryPending')}
            value={String(activeBookings.filter((booking) => booking.status === 'pending').length)}
            hint={t('summaryPendingHint')}
          />
          <SummaryCard
            icon={Clock3}
            label={t('summaryPast')}
            value={String(pastBookings.length)}
            hint={t('summaryPastHint')}
          />
          <SummaryCard
            icon={Calendar}
            label={t('summaryNextPickup')}
            value={nextPickup ? formatDateTime(nextPickup.start_datetime, locale) : '—'}
            hint={nextPickup?.car_name ?? t('summaryNextPickupEmpty')}
          />
        </div>

        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel className="text-secondary/75">{t(activeTab === 'active' ? 'activeSectionLabel' : 'pastSectionLabel')}</SectionLabel>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {activeTab === 'active' ? t('activeSectionTitle') : t('pastSectionTitle')}
              </h2>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {activeTab === 'active' ? t('activeSectionHint') : t('pastSectionHint')}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              <span>{visibleBookings.length}</span>
              <ChevronRight className="size-3.5 text-secondary" />
              <span>{t('resultsLabel')}</span>
            </div>
          </div>

          <Separator className="mb-6 bg-secondary/10" />

          {isPending && <BookingsLoading />}

          {!isPending && error && (
            <div className="rounded-[1.5rem] border border-destructive/15 bg-destructive/5 px-5 py-4 text-sm font-medium text-destructive">
              {t('loadFailed')}
            </div>
          )}

          {!isPending && !error && visibleBookings.length === 0 && <EmptyState tab={activeTab} />}

          {!isPending && !error && visibleBookings.length > 0 && (
            activeTab === 'active' ? (
              <GroupedBookings
                bookings={activeBookings}
                cancelling={cancelMutation.cancellingId}
                onCancel={handleCancel}
              />
            ) : (
              <div className="grid gap-5">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancel}
                    cancelling={cancelMutation.cancellingId === booking.id}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}

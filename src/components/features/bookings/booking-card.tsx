'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Car, CheckCircle2, Clock3, MessageCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SectionLabel } from '@/components/ui/section-label';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '@/types/booking';
import { cn } from '@/lib/utils';

type BookingStatus = 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';

const STATUS_BADGE_VARIANT: Record<BookingStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive'
};

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getDurationHours(startDatetime: string, endDatetime: string) {
  const diff = new Date(endDatetime).getTime() - new Date(startDatetime).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60)));
}

function getStatusPanel(
  status: BookingStatus,
  t: (key: string, values?: Record<string, string | number>) => string
) {
  switch (status) {
    case 'pending':
      return {
        title: t('statusPanel.pendingTitle'),
        body: t('statusPanel.pendingBody'),
        icon: Clock3,
        tone: 'text-foreground'
      };
    case 'approved':
      return {
        title: t('statusPanel.approvedTitle'),
        body: t('statusPanel.approvedBody'),
        icon: CheckCircle2,
        tone: 'text-secondary'
      };
    case 'active':
      return {
        title: t('statusPanel.activeTitle'),
        body: t('statusPanel.activeBody'),
        icon: Car,
        tone: 'text-secondary'
      };
    case 'completed':
      return {
        title: t('statusPanel.completedTitle'),
        body: t('statusPanel.completedBody'),
        icon: CheckCircle2,
        tone: 'text-foreground'
      };
    case 'cancelled':
      return {
        title: t('statusPanel.cancelledTitle'),
        body: t('statusPanel.cancelledBody'),
        icon: XCircle,
        tone: 'text-destructive'
      };
  }
}

function MetaBlock({
  label,
  value,
  hint,
  className
}: {
  label: string;
  value: string;
  hint: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <SectionLabel className="text-foreground/45">{label}</SectionLabel>
      <p className="mt-2 text-sm font-bold text-foreground sm:text-base">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p>
    </div>
  );
}

export function BookingCard({
  booking,
  onCancel,
  cancelling
}: {
  booking: Booking;
  onCancel: (id: number) => void;
  cancelling: boolean;
}) {
  const t = useTranslations('bookings');
  const locale = useLocale();
  const params = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const localeParam = typeof params?.locale === 'string' ? params.locale : locale;
  const status = booking.status as BookingStatus;
  const badgeVariant = STATUS_BADGE_VARIANT[status] ?? 'default';
  const panel = getStatusPanel(status, t);
  const canCancel = status === 'pending' || status === 'approved';
  const canContactSupport = Boolean(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) && status !== 'cancelled';
  const statusLabel =
    status === 'cancelled' && booking.cancellation_source === 'driver'
      ? t('cancelledByYou')
      : t(`status.${status}`);

  const totalLabel = status === 'completed' ? t('finalTotalLabel') : t('estimatedTotalLabel');
  const durationHours = useMemo(
    () => getDurationHours(booking.start_datetime, booking.end_datetime),
    [booking.end_datetime, booking.start_datetime]
  );

  const tags = [
    durationHours <= 24 ? t('sameDayRental') : t('multiDayRental'),
    t('supportReady'),
    t('bookingReferenceChip', { id: booking.id })
  ];

  const whatsappHref = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP
    ? `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`
    : null;

  return (
    <>
      <article className="surface-card rounded-[1.75rem] p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {booking.car_name ?? t('unknownCar')}
                </h2>
                <Badge variant={badgeVariant}>{statusLabel}</Badge>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('bookingId', { id: booking.id })}
              </p>
            </div>

            <div className="sm:min-w-[180px] sm:text-right">
              <SectionLabel className="text-foreground/45">{totalLabel}</SectionLabel>
              <p className="mt-2 text-xl font-extrabold text-secondary">
                {status === 'cancelled' ? '—' : `${booking.estimated_total_sar} SAR`}
              </p>
            </div>
          </div>

          <Separator className="bg-secondary/10" />

          <div className="border-l-4 border-secondary/30 bg-secondary/5 px-4 py-4 sm:px-5">
            <p className={cn('mb-2 flex items-center gap-2 text-sm font-bold', panel.tone)}>
              <panel.icon className="size-[18px]" />
              {panel.title}
            </p>
            <p className="text-xs font-medium leading-6 text-muted-foreground">{panel.body}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <MetaBlock
              label={t('startDatetime')}
              value={formatDateTime(booking.start_datetime, locale)}
              hint={t('startHint')}
            />
            <MetaBlock
              label={status === 'active' ? t('returnDate') : t('endDatetime')}
              value={formatDateTime(booking.end_datetime, locale)}
              hint={t('endHint')}
            />
            <MetaBlock
              label={t('duration')}
              value={t('durationHours', { count: durationHours })}
              hint={t('durationHint')}
            />
          </div>

          <Separator className="bg-secondary/10" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-muted/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-4 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  disabled={cancelling}
                  onClick={() => setConfirmOpen(true)}
                >
                  {t('cancelRequest')}
                </Button>
              )}

              {status !== 'pending' && (
                <Button variant="outline" size="sm" className="rounded-xl border-secondary/15 bg-white px-4 font-bold" asChild>
                  <Link href={`/${localeParam}/explore`}>{t('actionBrowseCars')}</Link>
                </Button>
              )}

              {canContactSupport && whatsappHref && (
                <Button size="sm" className="rounded-xl bg-primary px-4 font-bold hover:bg-secondary" asChild>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    {t('actionWhatsapp')}
                    <MessageCircle className="size-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm rounded-4xl">
          <DialogHeader>
            <DialogTitle>{t('cancelRequest')}</DialogTitle>
            <DialogDescription>{t('cancelConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="pill-outline">{t('cancelKeep')}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={cancelling}
              onClick={() => {
                setConfirmOpen(false);
                onCancel(booking.id);
              }}
            >
              {t('cancelRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

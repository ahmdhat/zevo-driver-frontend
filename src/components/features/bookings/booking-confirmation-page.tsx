'use client';

import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {CheckCircle, Calendar, Clock, ChevronRight} from 'lucide-react';

import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {SectionLabel} from '@/components/ui/section-label';
import {useBookings} from './use-bookings';

export function BookingConfirmationPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const bookingId = typeof params?.id === 'string' ? parseInt(params.id, 10) : null;

  const {data: bookings, isPending} = useBookings();
  const booking = bookings?.find((b) => b.id === bookingId) ?? null;

  if (isPending) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg px-6">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
          <div className="h-6 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-72 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  const nextSteps = [
    t('bookings.nextStepsItem1'),
    t('bookings.nextStepsItem2'),
    t('bookings.nextStepsItem3'),
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-6 md:px-20 py-12 max-w-[680px] mx-auto w-full">
        <Card className="overflow-hidden p-0 gap-0">
          <div className="bg-tertiary/10 border-b border-border px-8 py-10 text-center">
            <CheckCircle className="w-16 h-16 text-tertiary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('bookings.confirmationTitle')}
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t('bookings.confirmationSubtitle')}
            </p>
          </div>

          {booking && (
            <div className="px-8 py-6 border-b border-border">
              <SectionLabel className="mb-4 block">
                {t('bookings.bookingId', {id: booking.id})}
              </SectionLabel>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Calendar className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-muted-foreground w-20">{t('bookings.startDatetime')}</span>
                  <span>{new Date(booking.start_datetime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-muted-foreground w-20">{t('bookings.endDatetime')}</span>
                  <span>{new Date(booking.end_datetime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-muted-foreground w-20">{t('bookings.status.pending')}</span>
                  <Badge variant="secondary">{t('bookings.status.pending')}</Badge>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">{t('results.estimatedTotal')}</span>
                  <span className="text-lg font-extrabold text-secondary">{booking.estimated_total_sar} SAR</span>
                </div>
              </div>
            </div>
          )}

          <div className="px-8 py-6 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mb-4">{t('bookings.nextStepsTitle')}</h2>
            <ol className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-8 py-6">
            <Button
              variant="pill-outline"
              onClick={() => router.push(`/${locale}/bookings`)}
              className="w-full"
            >
              {t('bookings.viewMyBookings')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Car } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BookingCard } from './booking-card';
import type { Booking } from '@/types/booking';

export function BookingsList({
  bookings,
  cancelling,
  onCancel
}: {
  bookings: Booking[];
  cancelling: number | null;
  onCancel: (id: number) => void;
}) {
  const t = useTranslations('bookings');
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Car className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold mb-1">{t('empty')}</p>
        <Link href={`/${locale}/explore`}>
          <Button className="mt-4">
            {t('emptyAction')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancel}
          cancelling={cancelling === booking.id}
        />
      ))}
    </div>
  );
}

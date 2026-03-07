'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams, useParams } from 'next/navigation';
import { ArrowRight, Car as CarIcon, MapPin, Calendar } from 'lucide-react';

import type { Car } from '@/types/car';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaSlot } from '@/components/ui/media-slot';
import { SectionLabel } from '@/components/ui/section-label';

export function ResultsCard({
  car,
  priority,
}: {
  car: Car;
  priority: number;
}) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  const queryString = searchParams.toString();
  const detailUrl = `/${locale}/results/car/${car.id}${queryString ? `?${queryString}` : ''}`;
  const total = car.price_estimate.estimated_total_sar;

  return (
    <Card className="group overflow-hidden rounded-3xl p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div>
        <MediaSlot aspectRatio="3/2" className="inventory-media">
          {car.photo_path ? (
            <div
              className="absolute inset-0 bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${car.photo_path})` }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <CarIcon className="size-16 text-tertiary/30" />
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
              <Calendar className="size-4" />
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
            <SectionLabel>{t('results.estimatedTotal')}</SectionLabel>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {total} SAR
              {/* <span className="ml-1 text-xs font-bold text-muted-foreground">{t('results.cardMeta.selectedWindow')}</span> */}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto shrink-0">
            <Link href={detailUrl}>
              {t('common.viewAndBook')}
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

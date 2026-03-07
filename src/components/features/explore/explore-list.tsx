'use client';

import {useTranslations} from 'next-intl';

import {ExploreCard} from '@/components/features/explore/explore-card';
import {Separator} from '@/components/ui/separator';
import type {Car} from '@/types/car';

export function ExploreList({
  cars,
  onRequestToBook
}: {
  cars: Car[];
  onRequestToBook: (car: Car) => void;
}) {
  const t = useTranslations();

  if (cars.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm">
        {t('common.noVehicles')}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="text-sm font-medium">
        {t('common.vehiclesAvailable', {count: cars.length})}
      </div>
      <Separator />
      <div className="grid gap-4">
        {cars.map((car) => (
          <ExploreCard key={car.id} car={car} onRequestToBook={() => onRequestToBook(car)} />
        ))}
      </div>
    </div>
  );
}

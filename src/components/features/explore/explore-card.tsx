'use client';

import {useTranslations} from 'next-intl';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {Car} from '@/types/car';

export function ExploreCard({
  car,
  onRequestToBook
}: {
  car: Car;
  onRequestToBook: () => void;
}) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {car.year} {car.make} {car.model}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="text-sm text-muted-foreground">
          {t('explore.ratePerDay', {rate: car.daily_rate_sar})}
        </div>
        <div className="text-sm font-medium">
          {t('explore.estimatedTotal', {total: car.price_estimate.estimated_total_sar})}
        </div>

        <Button onClick={onRequestToBook}>{t('common.requestToBook')}</Button>
      </CardContent>
    </Card>
  );
}

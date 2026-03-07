'use client';

import {Suspense} from 'react';

import {VehicleDetailPage} from '@/components/features/results/vehicle-detail';

export default function Page() {
  return (
    <Suspense>
      <VehicleDetailPage />
    </Suspense>
  );
}

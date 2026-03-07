'use client';

import {Suspense} from 'react';

import {ResultsPage} from '@/components/features/results/results-page';

export default function Page() {
  return (
    <Suspense>
      <ResultsPage />
    </Suspense>
  );
}

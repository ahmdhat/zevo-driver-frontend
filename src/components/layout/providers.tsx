'use client';

import {useState} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from '@/components/ui/sonner';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors />
    </QueryClientProvider>
  );
}

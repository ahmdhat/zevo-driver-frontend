import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';

import {api} from '@/lib/api/client';
import {bookingKeys} from '@/lib/query-keys/bookings';
import {ApiException} from '@/types/api';
import type {ApiResponse} from '@/types/api';
import type {Booking} from '@/types/booking';

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.list(),
    queryFn: () =>
      api.get('api/v1/driver/bookings').json<ApiResponse<Booking[]>>()
        .then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('bookings');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (id: number) => {
      setCancellingId(id);
      return api.post(`api/v1/driver/bookings/${id}/cancel`).json<ApiResponse<Booking>>();
    },
    onSuccess: () => {
      toast.success(t('cancelSuccess'));
      queryClient.invalidateQueries({queryKey: bookingKeys.all});
    },
    onError: (error) => {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error(t('cancelFailed'));
      }
    },
    onSettled: () => {
      setCancellingId(null);
    },
  });

  return {...mutation, cancellingId};
}

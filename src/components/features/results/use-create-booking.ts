import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';

import {api} from '@/lib/api/client';
import {bookingKeys} from '@/lib/query-keys/bookings';
import type {ApiResponse} from '@/types/api';
import type {Booking, CreateBookingPayload} from '@/types/booking';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      api.post('api/v1/driver/bookings', {json: payload}).json<ApiResponse<Booking>>(),
    onSuccess: () => {
      toast.success(t('common.bookingRequested'));
      queryClient.invalidateQueries({queryKey: bookingKeys.all});
    },
  });
}

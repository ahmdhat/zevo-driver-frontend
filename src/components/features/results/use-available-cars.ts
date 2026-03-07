import {useQuery} from '@tanstack/react-query';

import {api} from '@/lib/api/client';
import {exploreKeys} from '@/lib/query-keys/explore';
import type {ApiResponse} from '@/types/api';
import type {Car} from '@/types/car';

export function useAvailableCars(params: {
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
}) {
  const enabled = !!(params.pickup_date && params.pickup_time && params.dropoff_date && params.dropoff_time);

  return useQuery({
    queryKey: exploreKeys.availableCars(params),
    queryFn: () =>
      api
        .get('api/v1/driver/cars/available', {searchParams: params})
        .json<ApiResponse<Car[]>>()
        .then((r) => r.data),
    enabled,
  });
}

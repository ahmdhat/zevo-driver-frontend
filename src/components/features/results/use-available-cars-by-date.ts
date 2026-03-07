import {useQuery} from '@tanstack/react-query';

import {api} from '@/lib/api/client';
import {exploreKeys} from '@/lib/query-keys/explore';
import type {ApiResponse} from '@/types/api';
import type {CarWithAvailableShifts} from '@/types/car';

export function useAvailableCarsByDate(params: {date: string}) {
  const enabled = !!params.date;

  return useQuery({
    queryKey: exploreKeys.availableCarsByDate(params),
    queryFn: () =>
      api
        .get('api/v1/driver/cars/available-shifts', {searchParams: params})
        .json<ApiResponse<CarWithAvailableShifts[]>>()
        .then((response) => response.data),
    enabled,
  });
}

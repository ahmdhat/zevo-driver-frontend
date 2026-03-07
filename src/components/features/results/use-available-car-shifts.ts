import {useQuery} from '@tanstack/react-query';

import {api} from '@/lib/api/client';
import {exploreKeys} from '@/lib/query-keys/explore';
import type {ApiResponse} from '@/types/api';
import type {CarWithAvailableShifts} from '@/types/car';

export function useAvailableCarShifts(id: number | null, params: {date: string}) {
  const enabled = !!(id && params.date);

  return useQuery({
    queryKey: exploreKeys.availableCarShifts(id ?? 0, params),
    queryFn: () =>
      api
        .get(`api/v1/driver/cars/available-shifts/${id}`, {searchParams: params})
        .json<ApiResponse<CarWithAvailableShifts>>()
        .then((response) => response.data),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

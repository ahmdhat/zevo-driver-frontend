import {useQuery} from '@tanstack/react-query';

import {api} from '@/lib/api/client';
import {exploreKeys} from '@/lib/query-keys/explore';
import type {ApiResponse} from '@/types/api';
import type {DriverCar} from '@/types/car';

export function useDriverCars() {
  return useQuery({
    queryKey: exploreKeys.cars(),
    queryFn: () =>
      api
        .get('api/v1/driver/cars')
        .json<ApiResponse<DriverCar[]>>()
        .then((r) => r.data),
  });
}

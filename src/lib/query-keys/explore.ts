export const exploreKeys = {
  all: ['explore'] as const,
  cars: () => [...exploreKeys.all, 'cars'] as const,
  availableCarsByDate: (params: {date: string}) => [...exploreKeys.all, 'available-cars-by-date', params] as const,
  availableCars: (params: {
    pickup_date: string;
    pickup_time: string;
    dropoff_date: string;
    dropoff_time: string;
  }) => [...exploreKeys.all, 'available-cars', params] as const,
  availableCar: (id: number, params: {
    pickup_date: string;
    pickup_time: string;
    dropoff_date: string;
    dropoff_time: string;
  }) => [...exploreKeys.all, 'available-car', id, params] as const,
  availableCarShifts: (id: number, params: {date: string}) => [...exploreKeys.all, 'available-car-shifts', id, params] as const,
};

import {useMemo, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';

import {api} from '@/lib/api/client';
import type {Car} from '@/types/car';
import type {ApiResponse} from '@/types/api';
import type {ExploreSearchForm} from '@/types/explore';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function getNextFullHour(now: Date) {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function useExplore() {
  const t = useTranslations();

  const defaultValues = useMemo<ExploreSearchForm>(() => {
    const now = new Date();
    const pickup = getNextFullHour(now);
    const dropoff = new Date(pickup);
    dropoff.setDate(dropoff.getDate() + 1);

    return {
      pickupDate: formatDate(pickup),
      pickupTime: formatTime(pickup),
      dropoffDate: formatDate(dropoff),
      dropoffTime: formatTime(pickup)
    };
  }, []);

  const [cars, setCars] = useState<Car[] | null>(null);
  const [lastSearch, setLastSearch] = useState<ExploreSearchForm>(defaultValues);

  const searchMutation = useMutation({
    mutationFn: (values: ExploreSearchForm) =>
      api
        .get('api/v1/driver/cars/available', {
          searchParams: {
            pickup_date: values.pickupDate,
            pickup_time: values.pickupTime,
            dropoff_date: values.dropoffDate,
            dropoff_time: values.dropoffTime
          }
        })
        .json<ApiResponse<Car[]>>()
        .then((r) => r.data),
    onSuccess: (data) => {
      setCars(data);
    },
    onError: () => {
      setCars(null);
      toast.error(t('common.errors.loadCars'));
    },
  });

  const search = (values: ExploreSearchForm) => {
    setLastSearch(values);
    searchMutation.mutate(values);
  };

  return {
    cars,
    loading: searchMutation.isPending,
    defaultValues,
    lastSearch,
    search
  };
}

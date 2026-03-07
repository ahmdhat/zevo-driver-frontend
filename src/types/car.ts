export type PriceEstimate = {
  full_days: number;
  remaining_minutes: number;
  remaining_charge_sar: number;
  capped_remaining_charge_sar: number;
  estimated_total_sar: number;
};

export type Car = {
  id: number;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  daily_rate_sar: number;
  hourly_rate_sar: number;
  photo_path: string | null;
  operational_status: string;
  city: string;
  price_estimate: PriceEstimate;
};

export type AvailableShift = {
  code: 'morning' | 'evening' | 'night';
  is_available: boolean;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  start_datetime: string;
  end_datetime: string;
  price_estimate: PriceEstimate;
};

export type CarWithAvailableShifts = Omit<Car, 'price_estimate'> & {
  available_shifts: AvailableShift[];
};

export type DriverCar = {
  id: number;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  daily_rate_sar: number;
  hourly_rate_sar: number;
  photo_path: string | null;
  operational_status: string;
  city: string;
};

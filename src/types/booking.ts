export type CreateBookingPayload = {
  car_id: number;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
};

export type Booking = {
  id: number;
  car_id: number;
  driver_id: number;
  status: string;
  start_datetime: string;
  end_datetime: string;
  estimated_total_sar: number;
  car_name: string | null;
  cancellation_source: string | null;
};

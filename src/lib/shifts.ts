import type {Car, CarWithAvailableShifts} from '@/types/car';

export type ShiftType = 'morning' | 'evening' | 'night';

export const SHIFT_TIMES: Record<ShiftType, {pickup: string; dropoff: string}> = {
  morning: {pickup: '06:00', dropoff: '14:00'},
  evening: {pickup: '14:00', dropoff: '22:00'},
  night: {pickup: '22:00', dropoff: '06:00'},
};

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function addDays(value: string, amount: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount);

  return formatDate(date);
}

export function getTodayDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  return formatDate(date);
}

export function getDerivedSelection(
  pickupDate: string,
  pickupTime: string,
  dropoffDate: string,
  dropoffTime: string,
) {
  const today = getTodayDate(0);
  const tomorrow = getTodayDate(1);

  const shift = (Object.keys(SHIFT_TIMES) as ShiftType[]).find((key) => {
    if (pickupTime !== SHIFT_TIMES[key].pickup || dropoffTime !== SHIFT_TIMES[key].dropoff) {
      return false;
    }

    if (key === 'night') {
      return dropoffDate === addDays(pickupDate, 1);
    }

    return pickupDate === dropoffDate;
  }) ?? null;

  const day: 'today' | 'tomorrow' | 'custom' =
    pickupDate === today ? 'today' : pickupDate === tomorrow ? 'tomorrow' : 'custom';

  return {day, shift, customDate: day === 'custom' ? pickupDate : undefined};
}

export function getDateForDay(day: 'today' | 'tomorrow' | 'custom', customDate?: string) {
  if (day === 'custom' && customDate) {
    return customDate;
  }

  if (day === 'tomorrow') {
    return getTodayDate(1);
  }

  return getTodayDate(0);
}

export function buildSearchParams(day: 'today' | 'tomorrow' | 'custom', shift: ShiftType, customDate?: string) {
  const pickupDate = getDateForDay(day, customDate);
  const pickupTime = SHIFT_TIMES[shift].pickup;
  const dropoffTime = SHIFT_TIMES[shift].dropoff;

  return {
    pickup_date: pickupDate,
    pickup_time: pickupTime,
    dropoff_date: shift === 'night' ? addDays(pickupDate, 1) : pickupDate,
    dropoff_time: dropoffTime,
  };
}

export function getAvailableShift(car: CarWithAvailableShifts, shift: ShiftType | null) {
  if (!shift) {
    return null;
  }

  return car.available_shifts.find((item) => item.code === shift) ?? null;
}

export function mapCarForShift(car: CarWithAvailableShifts, shift: ShiftType | null): Car | null {
  const availableShift = getAvailableShift(car, shift);

  if (!availableShift || !availableShift.is_available) {
    return null;
  }

  return mapCarForDisplayShift(car, shift);
}

export function mapCarForDisplayShift(car: CarWithAvailableShifts, shift: ShiftType | null): Car | null {
  const displayShift = getAvailableShift(car, shift) ?? car.available_shifts[0] ?? null;

  if (!displayShift) {
    return null;
  }

  return {
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    plate_number: car.plate_number,
    daily_rate_sar: car.daily_rate_sar,
    hourly_rate_sar: car.hourly_rate_sar,
    photo_path: car.photo_path,
    operational_status: car.operational_status,
    city: car.city,
    price_estimate: displayShift.price_estimate,
  };
}

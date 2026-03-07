import {z} from 'zod';
import dayjs from 'dayjs';

const baseExploreSchema = z.object({
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  dropoffDate: z.string().min(1),
  dropoffTime: z.string().min(1),
});

export type ExploreSearchForm = z.infer<typeof baseExploreSchema>;

function parseWindow(data: ExploreSearchForm) {
  return {
    start: dayjs(`${data.pickupDate} ${data.pickupTime}`),
    end: dayjs(`${data.dropoffDate} ${data.dropoffTime}`),
  };
}

export function makeExploreSearchSchema(msgs: {
  pickupInPast: string;
  dropoffBeforePickup: string;
  minDuration: string;
}) {
  return baseExploreSchema
    .refine(
      (data) => {
        const {start} = parseWindow(data);
        return start.isValid() ? !start.isBefore(dayjs()) : true;
      },
      {message: msgs.pickupInPast, path: ['pickupDate']},
    )
    .refine(
      (data) => {
        const {start, end} = parseWindow(data);
        if (!start.isValid() || !end.isValid() || start.isBefore(dayjs())) return true;
        return end.isAfter(start);
      },
      {message: msgs.dropoffBeforePickup, path: ['dropoffDate']},
    )
    .refine(
      (data) => {
        const {start, end} = parseWindow(data);
        if (!start.isValid() || !end.isValid() || start.isBefore(dayjs()) || !end.isAfter(start)) return true;
        return end.diff(start, 'minute') >= 240;
      },
      {message: msgs.minDuration, path: ['dropoffTime']},
    );
}

'use client';

import { useTranslations } from 'next-intl';
import { Sun, Moon, MoonStar } from 'lucide-react';

import { cn } from '@/lib/utils';

export type ShiftType = 'morning' | 'evening' | 'night';

export const SHIFTS: Record<ShiftType, { icon: typeof Sun; timeRange: string }> = {
  morning: { icon: Sun, timeRange: '6:00 AM – 2:00 PM' },
  evening: { icon: Moon, timeRange: '2:00 PM – 10:00 PM' },
  night: { icon: MoonStar, timeRange: '10:00 PM – 6:00 AM' },
};

export type ShiftType = 'morning' | 'afternoon' | 'evening';

export function ShiftSelector({
  value,
  onChange,
}: {
  value: ShiftType | null;
  onChange: (shift: ShiftType) => void;
}) {
  const t = useTranslations('explore');

  return (
    <div className="grid grid-cols-1 max-[400px]:grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3">
      {(Object.keys(SHIFTS) as ShiftType[]).map((shift) => {
        const { icon: Icon, timeRange } = SHIFTS[shift];
        const isSelected = value === shift;

        return (
          <button
            key={shift}
            type="button"
            onClick={() => onChange(shift)}
            className={cn(
              'flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-2 rounded-2xl sm:rounded-3xl border-2 p-3 sm:p-4 text-left sm:text-center transition-all',
              isSelected
                ? 'border-primary bg-muted/35'
                : 'border-secondary/10 bg-white hover:border-secondary/20 hover:bg-muted/20'
            )}
          >
            <Icon className={cn('w-6 h-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
            <div className="flex flex-col sm:items-center">
              <span className={cn('text-sm font-bold', isSelected ? 'text-primary' : 'text-foreground')}>
                {t(`shift.${shift}`)}
              </span>
              <span className="text-[11px] text-muted-foreground">{timeRange}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

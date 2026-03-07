'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export type DayType = 'today' | 'tomorrow' | 'custom';

export function DaySelector({
  value,
  customDate,
  onChange,
}: {
  value: DayType;
  customDate?: string;
  onChange: (day: DayType, customDate?: string) => void;
}) {
  const t = useTranslations('explore');
  const inputRef = useRef<HTMLInputElement>(null);

  function openDatePicker() {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  }

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
      <input
        ref={inputRef}
        type="date"
        className="sr-only"
        min={new Date().toISOString().split('T')[0]}
        value={value === 'custom' ? customDate ?? '' : ''}
        onChange={(event) => {
          if (event.target.value) {
            onChange('custom', event.target.value);
          }
        }}
      />
      {(['today', 'tomorrow', 'custom'] as DayType[]).map((day) => (
        <Button
          key={day}
          type="button"
          variant={value === day ? 'default' : 'outline'}
          onClick={() => {
            if (day === 'custom') {
              openDatePicker();
            } else {
              onChange(day);
            }
          }}
          className={day === 'custom' ? 'col-span-2 sm:col-span-1' : ''}
        >
          {day === 'custom' && value === 'custom' && customDate
            ? customDate
            : t(`day.${day}`)}
        </Button>
      ))}
    </div>
  );
}

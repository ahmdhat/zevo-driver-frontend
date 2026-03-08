'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type DayType = 'today' | 'tomorrow' | 'custom';

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  const [open, setOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value === 'custom' && customDate
    ? parseLocalDate(customDate)
    : undefined;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
      {(['today', 'tomorrow'] as DayType[]).map((day) => (
        <Button
          key={day}
          type="button"
          variant={value === day ? 'default' : 'outline'}
          onClick={() => onChange(day)}
        >
          {t(`day.${day}`)}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={value === 'custom' ? 'default' : 'outline'}
            className="col-span-2 sm:col-span-1"
          >
            {value === 'custom' && customDate ? customDate : t('day.custom')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange('custom', formatLocalDate(date));
                setOpen(false);
              }
            }}
            disabled={(date) => date < today}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

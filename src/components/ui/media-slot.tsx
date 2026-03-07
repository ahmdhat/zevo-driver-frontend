'use client';

import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

export function MediaSlot({
  children,
  aspectRatio = '16/11',
  className,
}: {
  children?: React.ReactNode;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('media-slot', className)}
      style={{ aspectRatio }}
    >
      {children ?? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="w-16 h-16 text-tertiary/30" />
        </div>
      )}
    </div>
  );
}

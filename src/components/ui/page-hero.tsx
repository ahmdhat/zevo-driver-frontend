'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { SectionLabel } from '@/components/ui/section-label';
import { cn } from '@/lib/utils';

export function PageHero({
  backLink,
  backLabel,
  label,
  title,
  subtitle,
  children,
  className,
}: {
  backLink?: string;
  backLabel?: string;
  label?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-secondary/10 bg-transparent px-6 py-6 md:px-20', className)}>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          {backLink && (
            <Link
              href={backLink}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          )}
          {label && <SectionLabel className="text-secondary/70 mb-1">{label}</SectionLabel>}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children && <div className="flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}

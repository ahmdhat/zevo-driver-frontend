'use client';

import {DriverHeader} from '@/components/layout/driver-header';
import {DriverFooter} from '@/components/layout/driver-footer';

export default function PublicLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DriverHeader />
      <main className="flex-1">{children}</main>
      <DriverFooter />
    </div>
  );
}

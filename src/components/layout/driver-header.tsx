'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Car, LogOut, Menu, X } from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { OtpAuthModal } from '@/components/features/auth/otp-auth-modal';

export function DriverHeader() {
  const t = useTranslations();
  const params = useParams();
  const pathname = usePathname();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(path: string) {
    return pathname?.includes(path);
  }

  function handleMobileNavClick() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md px-6 md:px-20 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between whitespace-nowrap">
          <Link href={`/${locale}/explore`} className="flex items-center gap-3">
            <div className="size-10 flex items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-foreground">
              {t('common.appName')}
            </span>
          </Link>

          <div className="flex flex-1 justify-end items-center gap-8">
            <nav className="hidden md:flex items-center gap-9">
              <Link
                href={`/${locale}/explore`}
                className={`text-sm font-semibold transition-colors pb-1 ${isActive('/explore')
                    ? 'text-foreground border-b-2 border-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('common.navCars')}
              </Link>
              {token && (
                <Link
                  href={`/${locale}/bookings`}
                  className={`text-sm font-semibold transition-colors pb-1 ${isActive('/bookings')
                      ? 'text-foreground border-b-2 border-primary font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {t('common.navMyBookings')}
                </Link>
              )}
              <a
                href="#"
                className="text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
              >
                {t('common.navSupport')}
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <Button onClick={logout} variant="pill-outline" className="font-bold">
                  <LogOut className="w-4 h-4" />
                  {t('common.signOut')}
                </Button>
              ) : (
                <Button className="font-bold" onClick={() => setAuthOpen(true)}>
                  {t('common.signIn')}
                </Button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center size-10 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-border">
            <nav className="flex flex-col gap-1 pt-4">
              <Link
                href={`/${locale}/explore`}
                onClick={handleMobileNavClick}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive('/explore')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {t('common.navCars')}
              </Link>
              {token && (
                <Link
                  href={`/${locale}/bookings`}
                  onClick={handleMobileNavClick}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive('/bookings')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {t('common.navMyBookings')}
                </Link>
              )}
              <a
                href="#"
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {t('common.navSupport')}
              </a>
              <div className="pt-3 mt-1 border-t border-border">
                {token ? (
                  <Button
                    onClick={() => { logout(); handleMobileNavClick(); }}
                    variant="pill-outline"
                    className="w-full font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.signOut')}
                  </Button>
                ) : (
                  <Button
                    className="w-full font-bold"
                    onClick={() => { setAuthOpen(true); handleMobileNavClick(); }}
                  >
                    {t('common.signIn')}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <OtpAuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthed={() => setAuthOpen(false)}
      />
    </>
  );
}

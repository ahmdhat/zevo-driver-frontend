import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const COOKIE_NAME = 'fleethub_driver_token';

function setAuthCookie(token: string | null) {
  if (typeof document === 'undefined') return;

  if (!token) {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  // 30 days
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        setAuthCookie(token);
        set({token});
      },
      logout: () => {
        setAuthCookie(null);
        set({token: null});
      }
    }),
    {name: 'fleethub.driver.auth'}
  )
);

export function getAuthCookieName() {
  return COOKIE_NAME;
}

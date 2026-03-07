import ky from 'ky';

import { useAuthStore } from '@/stores/auth-store';
import { getCurrentLocale } from '@/lib/i18n/get-current-locale';
import { ApiException } from '@/types/api';

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
        request.headers.set('Accept-Language', getCurrentLocale());
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          const body = await response.clone().json().catch(() => null);
          if (body?.error?.message) {
            throw new ApiException(body.error);
          }
        }
      }
    ]
  }
});

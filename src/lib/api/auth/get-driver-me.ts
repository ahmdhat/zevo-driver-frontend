import {api} from '@/lib/api/client';
import type {ApiResponse} from '@/types/api';

export type DriverMe = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  primary_role: string;
};

export async function getDriverMe() {
  return api.get('api/v1/driver/auth/me').json<ApiResponse<DriverMe>>();
}

import {z} from 'zod';

export function createPhoneSchema(t: (key: string) => string) {
  return z
    .string()
    .regex(/^05\d{8}$/, {message: t('auth.validation.phone')});
}

export function createRequestOtpSchema(t: (key: string) => string) {
  return z.object({
    phone: createPhoneSchema(t)
  });
}

export type RequestOtpForm = z.infer<ReturnType<typeof createRequestOtpSchema>>;

export function createVerifyOtpSchema(t: (key: string) => string) {
  return z.object({
    phone: createPhoneSchema(t),
    code: z.string().regex(/^\d{4}$/, {message: t('auth.validation.code')}),
    firstName: z.string().max(80).optional().or(z.literal('')),
    lastName: z.string().max(80).optional().or(z.literal(''))
  });
}

export type VerifyOtpForm = z.infer<ReturnType<typeof createVerifyOtpSchema>>;

export type RequestOtpPayload = {
  phone: string;
};

export type RequestOtpResult = {
  expires_in_seconds: number;
  resend_in_seconds: number;
  is_existing_user: boolean;
};

export type VerifyOtpPayload = {
  phone: string;
  code: string;
  first_name?: string;
  last_name?: string;
};

export type VerifyOtpResult = {
  token: string;
  is_new_user: boolean;
};

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useTranslations} from 'next-intl';

import {api} from '@/lib/api/client';
import {useAuthStore} from '@/stores/auth-store';
import {ApiException} from '@/types/api';
import type {ApiResponse} from '@/types/api';
import type {RequestOtpResult, VerifyOtpPayload, VerifyOtpResult} from '@/types/auth';

export type OtpStep = 'phone' | 'code';

export function useOtpAuth() {
  const t = useTranslations();
  const setToken = useAuthStore((s) => s.setToken);

  const [step, setStep] = useState<OtpStep>('phone');
  const [phone, setPhone] = useState<string>('');
  const [resendIn, setResendIn] = useState<number>(0);
  const [needName, setNeedName] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(() => {
      setResendIn((v) => Math.max(0, v - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendIn]);

  const canResend = useMemo(() => resendIn === 0, [resendIn]);

  const sendOtpMutation = useMutation({
    mutationFn: (nextPhone: string) =>
      api
        .post('api/v1/driver/auth/otp/request', {json: {phone: nextPhone}})
        .json<ApiResponse<RequestOtpResult>>(),
    onSuccess: (response, nextPhone) => {
      setPhone(nextPhone);
      setNeedName(!response.data.is_existing_user);
      setStep('code');
      setResendIn(response.data.resend_in_seconds);
    },
    onError: (e) => {
      if (e instanceof ApiException) {
        const retryAfter = e.error.details?.retry_after as number | undefined;
        if (retryAfter) {
          toast.error(t('errors.otp.rateLimitWithRetry', {seconds: retryAfter}));
        } else {
          toast.error(e.message);
        }
      } else {
        toast.error(t('errors.otp.requestFailed'));
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpPayload) =>
      api
        .post('api/v1/driver/auth/otp/verify', {json: payload})
        .json<ApiResponse<VerifyOtpResult>>(),
    onSuccess: (response) => {
      setToken(response.data.token);
      toast.success(t('auth.success'));
    },
    onError: (e) => {
      if (e instanceof ApiException && e.hasFieldErrors) {
        const codeError = e.error.field_errors?.['code'];
        const nameError = e.error.field_errors?.['first_name'] || e.error.field_errors?.['last_name'];
        if (nameError) {
          setNeedName(true);
        }
        if (codeError) {
          toast.error(codeError);
        } else if (nameError) {
          toast.error(nameError);
        } else {
          toast.error(t('errors.otp.verifyFailed'));
        }
      } else if (e instanceof ApiException) {
        toast.error(e.message);
      } else {
        setNeedName(true);
        toast.error(t('errors.otp.verifyFailed'));
      }
    },
  });

  const sendOtp = useCallback(
    (nextPhone: string) => {
      sendOtpMutation.mutate(nextPhone);
    },
    [sendOtpMutation]
  );

  const resendOtp = useCallback(() => {
    if (!canResend || !phone) return;
    sendOtp(phone);
  }, [canResend, phone, sendOtp]);

  const goBackToPhone = useCallback(() => {
    setStep('phone');
    setResendIn(0);
  }, []);

  const submitCode = useCallback(
    async ({
      code,
      firstName,
      lastName
    }: {
      code: string;
      firstName?: string;
      lastName?: string;
    }) => {
      return new Promise<{ok: boolean}>((resolve) => {
        verifyOtpMutation.mutate(
          {
            phone,
            code,
            first_name: firstName,
            last_name: lastName
          },
          {
            onSuccess: () => resolve({ok: true}),
            onError: () => resolve({ok: false}),
          }
        );
      });
    },
    [phone, verifyOtpMutation]
  );

  const reset = useCallback(() => {
    setStep('phone');
    setPhone('');
    setResendIn(0);
    setNeedName(false);
  }, []);

  const loading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return {
    step,
    phone,
    loading,
    resendIn,
    canResend,
    needName,
    sendOtp,
    resendOtp,
    goBackToPhone,
    submitCode,
    reset
  };
}

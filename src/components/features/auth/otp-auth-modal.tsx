'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Car, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InputControlled } from '@/components/ui/controllers/input-controlled';
import { InputOtpControlled } from '@/components/ui/controllers/input-otp-controlled';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createRequestOtpSchema, createVerifyOtpSchema, type RequestOtpForm, type VerifyOtpForm } from '@/types/auth';
import { useOtpAuth } from '@/components/features/auth/use-otp-auth';

export function OtpAuthModal({
  open,
  onOpenChange,
  onAuthed
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthed: () => void;
}) {
  const t = useTranslations();
  const { step, phone, loading, resendIn, canResend, needName, sendOtp, resendOtp, goBackToPhone, submitCode, reset } = useOtpAuth();

  const requestOtpSchema = useMemo(() => createRequestOtpSchema(t), [t]);
  const verifyOtpSchema = useMemo(() => createVerifyOtpSchema(t), [t]);

  const phoneForm = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { phone: '' },
    mode: 'onChange'
  });

  const codeForm = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: '', code: '', firstName: undefined, lastName: undefined }
  });

  useEffect(() => {
    if (!open) {
      reset();
      phoneForm.reset();
      codeForm.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-0 overflow-hidden max-w-sm gap-0">
        {/* Branded header */}
        <div className="bg-primary px-8 pt-8 pb-10 flex flex-col items-center text-center">
          <div className="size-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
            <Car className="size-7 text-white" />
          </div>
          <p className="text-white text-xl font-bold">{t('common.appName')}</p>
          <p className="text-white/70 text-sm font-medium mt-1">
            {step === 'phone' ? t('auth.phoneTitle') : t('auth.codeTitle')}
          </p>
        </div>

        {/* Form area */}
        <div className="px-8 pt-8 pb-8 -mt-4 bg-white rounded-t-3xl">
          {step === 'phone' ? (
            <form
              key="phone"
              className="flex flex-col gap-4"
              onSubmit={phoneForm.handleSubmit(async (values) => {
                await sendOtp(values.phone);
                codeForm.setValue('phone', values.phone);
              })}
            >
              <InputControlled
                control={phoneForm.control}
                name="phone"
                label={t('auth.phoneTitle')}
                placeholder={t('auth.phoneHint')}
              />

              <Button type="submit" className="w-full mt-1" disabled={loading || !phoneForm.formState.isValid}>
                {t('auth.continue')}
              </Button>
            </form>
          ) : (
            <form
              key="code"
              className="flex flex-col gap-4"
              onSubmit={codeForm.handleSubmit(async (values) => {
                const result = await submitCode({
                  code: values.code,
                  firstName: values.firstName || undefined,
                  lastName: values.lastName || undefined
                });

                if (result.ok) {
                  onOpenChange(false);
                  onAuthed();
                }
              })}
            >
              {/* Sent-to hint */}
              {phone && (
                <div className="flex items-center gap-2.5 rounded-xl bg-muted px-4 py-3">
                  <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="font-semibold text-foreground">{phone}</span>
                  </p>
                </div>
              )}

              <InputOtpControlled
                control={codeForm.control}
                name="code"
                label={t('auth.codeHint')}
                length={4}
                resendIn={resendIn}
                onResend={canResend ? resendOtp : undefined}
              />

              {needName && (
                <>
                  <InputControlled
                    control={codeForm.control}
                    name="firstName"
                    label={t('auth.firstName')}
                  />
                  <InputControlled
                    control={codeForm.control}
                    name="lastName"
                    label={t('auth.lastName')}
                  />
                </>
              )}

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {t('auth.verify')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  goBackToPhone();
                  phoneForm.setValue('phone', phone);
                  codeForm.resetField('code');
                }}
              >
                {t('auth.changeNumber')}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

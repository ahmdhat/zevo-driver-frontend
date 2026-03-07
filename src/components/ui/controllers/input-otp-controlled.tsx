import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { RefreshCwIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"

const otpSlotClass = "*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl"

interface InputOtpControlledProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    length?: 4 | 6;
    resendIn?: number;
    onResend?: () => void;
}

function OtpSlots({ length }: { length: 4 | 6 }) {
    if (length === 4) {
        return (
            <InputOTPGroup className={otpSlotClass}>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
            </InputOTPGroup>
        )
    }

    return (
        <>
            <InputOTPGroup className={otpSlotClass}>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator className="mx-2" />
            <InputOTPGroup className={otpSlotClass}>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </>
    )
}

export function InputOtpControlled<T extends FieldValues>({ control, name, label, length = 6, resendIn, onResend }: InputOtpControlledProps<T>) {
    const t = useTranslations("auth")

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={name}>
                            {label}
                        </FieldLabel>
                        {onResend ? (
                            <Button type="button" variant="outline" onClick={onResend}>
                                <RefreshCwIcon />
                                {t("resend")}
                            </Button>
                        ) : resendIn && resendIn > 0 ? (
                            <span className="text-xs text-muted-foreground">
                                {t("resendIn", { seconds: resendIn })}
                            </span>
                        ) : null}
                    </div>
                    <InputOTP {...field} maxLength={length} id={name}>
                        <OtpSlots length={length} />
                    </InputOTP>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    )
}

import { Input } from "../input";
import { Field, FieldError, FieldLabel } from "../field";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { type ComponentProps } from "react";

type InputControlledProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
    label: string;
} & Omit<ComponentProps<typeof Input>, "name">;

export const InputControlled = <T extends FieldValues>({
    name,
    control,
    label,
    ...inputProps
}: InputControlledProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>
                        {label}
                    </FieldLabel>
                    <Input
                        {...field}
                        {...inputProps}
                        id={name}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                    />
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
};

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp";

interface OtpFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  errors: ({ message?: string } | undefined)[];
}

export function OtpField({
  value,
  onChange,
  onBlur,
  isInvalid,
  errors
}: OtpFieldProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="otp" className="text-sm text-muted-foreground">
        One-time password
      </FieldLabel>
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={isInvalid}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

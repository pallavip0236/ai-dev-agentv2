
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { toast } from "sonner";
import { useVerifySigninOtp, useVerifySignupOtp } from "@/hooks/use-auth";

/* ================= ZOD ================= */

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

/* ================= TYPES ================= */

type Props = {
  email: string;
  mode?: "signin" | "signup";
  name?: string;
  onSuccess?: () => void;
  onBack?: () => void;
};

/* ================= OTP FORM ================= */

export default function OtpForm({ email, mode = "signin", name = "", onSuccess, onBack }: Props) {
  const navigate = useNavigate();
  const verifySigninOtp = useVerifySigninOtp();
  const verifySignupOtp = useVerifySignupOtp();

  const form = useForm({
    defaultValues: { otp: "" },

    onSubmit: async ({ value }) => {
      const parsed = otpSchema.safeParse(value);

      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      try {
        const res =
          mode === "signup"
            ? await verifySignupOtp.mutateAsync({
                email,
                otp: value.otp,
                name
              })
            : await verifySigninOtp.mutateAsync({
                email,
                otp: value.otp
              });

        if (res.status === 200 || res.status === 201) {
          toast.success(mode === "signup" ? "Account created successfully" : "Login successful");

          // Save login state
          localStorage.setItem("auth", "true");

          // Redirect to dashboard
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/dashboard");
          }
        } else {
          toast.error("Invalid or expired OTP");
        }
      } catch {
        toast.error("Verification failed");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* OTP INPUT */}
      <div>
        <p className="text-[12px] text-gray-300 mb-2">Enter 6-digit OTP</p>

        <form.Field name="otp">
          {(field) => (
            <input
              type="text"
              maxLength={6}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="••••••"
              className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-[13px] outline-none"
            />
          )}
        </form.Field>
      </div>

      {/* VERIFY BUTTON */}
      <button
        type="submit"
        disabled={verifySigninOtp.isPending || verifySignupOtp.isPending}
        className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium flex justify-center text-[13px]"
      >
        {verifySigninOtp.isPending || verifySignupOtp.isPending ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          "Verify OTP"
        )}
      </button>

      {/* BACK BUTTON */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] text-gray-400 hover:text-white w-full"
        >
          ← Use different email
        </button>
      )}
    </form>
  );
}

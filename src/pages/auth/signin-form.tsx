import { ZSendOtpRequest } from "@/zod/auth";
import { useForm } from "@tanstack/react-form";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { GoogleButton } from "@/components/auth/google-button";
import { useSendSigninOtp, useVerifySigninOtp } from "@/hooks/use-auth";

/* ---------------- ZOD SCHEMA ---------------- */

// remove name from signup schema and reuse for signin
const signinSchema = ZSendOtpRequest.omit({ name: true });

export default function SigninPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const navigate = useNavigate();

  const { mutateAsync: sendOtp, isPending: sendingOtp } = useSendSigninOtp();
  const { mutateAsync: verifyOtp, isPending: verifyingOtp } = useVerifySigninOtp();

  /* ================= EMAIL FORM ================= */

  const emailForm = useForm({
    defaultValues: {
      email: "",
    },

    validators: {
      onSubmit: signinSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        const res = await sendOtp({ email: value.email });

        if (res?.status === 200) {
          setSubmittedEmail(value.email);
          setStep("otp");
          toast.success("OTP sent to your email ✉️");
        } else {
          toast.error("Account not found");
        }
      } catch (error) {
        toast.error("Failed to send OTP");
      }
    },
  });

  /* ================= OTP FORM ================= */

  const otpForm = useForm({
    defaultValues: {
      otp: "",
    },

    onSubmit: async ({ value }) => {
      if (value.otp.length !== 6) {
        toast.error("OTP must be 6 digits");
        return;
      }

      try {
        const res = await verifyOtp({
          email: submittedEmail,
          otp: value.otp,
        });

        if (res?.status === 200) {
          toast.success("Login successful 🎉");
          localStorage.setItem("auth", "true");
          navigate("/dashboard");
        } else {
          toast.error("Invalid or expired OTP");
        }
      } catch (error) {
        toast.error("Verification failed");
      }
    },
  });

  return (
<div className="min-h-screen flex items-center justify-center bg-[#060c1b] px-8 py-14">
        <div className="glass-card w-[420px] p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
        {/* ---------- TITLE ---------- */}

        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold text-white">AI Dashboard</h2>

          <p className="text-[12px] text-gray-400 mt-1">
            Admin Portal — Sign in to continue
          </p>
        </div>

        <div className="mb-5">
          <GoogleButton />
        </div>

        <div className="flex items-center gap-3 text-[12px] text-gray-400 mb-6">
          <div className="flex-1 border-t border-white/10" />
          or sign in with email
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* ================= EMAIL STEP ================= */}

        {step === "email" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              emailForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <emailForm.Field name="email">
              {(field) => (
                <div>
                  <p className="text-[12px] text-gray-300 mb-2">Email address</p>

                  <div className="flex items-center bg-[#020617] border border-white/10 rounded-lg px-3">
                    <Mail size={16} className="text-gray-400" />

                    <input
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="admin@company.com"
                      className="bg-transparent w-full p-3 outline-none text-white text-[13px]"
                    />
                  </div>

                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-red-400 text-[11px] mt-1">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </emailForm.Field>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-lg font-medium flex justify-center text-[13px]"
            >
              {sendingOtp ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* ================= OTP STEP ================= */}

        {step === "otp" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              otpForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <otpForm.Field name="otp">
              {(field) => (
                <div>
                  <p className="text-[12px] text-gray-300 mb-2">
                    Enter 6-digit OTP sent to {submittedEmail}
                  </p>

                  <input
                    type="text"
                    maxLength={6}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-[#020617] border border-white/10 rounded-lg p-3 text-white text-[13px] outline-none"
                  />
                </div>
              )}
            </otpForm.Field>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium flex justify-center text-[13px]"
            >
              {verifyingOtp ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Verify OTP"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-[12px] text-gray-400 hover:text-white w-full"
            >
              ← Use different email
            </button>
          </form>
        )}

        {/* ---------- SIGNUP LINK ---------- */}

        <div className="text-center mt-6">
          <p className="text-[12px] text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

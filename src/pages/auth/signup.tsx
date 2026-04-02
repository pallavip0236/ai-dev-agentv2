import { useForm } from "@tanstack/react-form";
import { Mail, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { GoogleButton } from "@/components/auth/google-button";
import { useSendSignupOtp, useVerifySignupOtp } from "@/hooks/use-auth";

const detailsSchema = z.object({
  name: z.string().min(2, "Enter a valid name"),
  email: z.string().email("Enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function SignupPage() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const navigate = useNavigate();
  const sendOtp = useSendSignupOtp();
  const verifyOtp = useVerifySignupOtp();

  const detailsForm = useForm({
    defaultValues: { name: "", email: "" },

    validators: {
      onSubmit: ({ value }) => {
        const parsed = detailsSchema.safeParse(value);
        if (!parsed.success) return parsed.error.issues[0].message;
        return undefined;
      },
    },

    onSubmit: async ({ value }) => {
      try {
        const res = await sendOtp.mutateAsync({
          name: value.name,
          email: value.email,
        });

        if (res.status === 200) {
          setSubmittedEmail(value.email);
          setSubmittedName(value.name);
          setStep("otp");
          toast.success("OTP sent to your email");
        } else if (res.status === 409) {
          toast.error("Email already registered. Sign in instead.");
        } else {
          toast.error("Failed to send OTP");
        }
      } catch {
        toast.error("Something went wrong");
      }
    },
  });

  const otpForm = useForm({
    defaultValues: { otp: "" },

    validators: {
      onSubmit: ({ value }) => {
        const parsed = otpSchema.safeParse(value);
        if (!parsed.success) return parsed.error.issues[0].message;
        return undefined;
      },
    },

    onSubmit: async ({ value }) => {
      try {
        const res = await verifyOtp.mutateAsync({
          email: submittedEmail,
          otp: value.otp,
          name: submittedName,
        });

        if (res.status === 201) {
          toast.success("Account created successfully");
          navigate("/dashboard");
        } else {
          toast.error("Invalid or expired OTP");
        }
      } catch {
        toast.error("Verification failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] px-8 py-14">

      <div className="glass-card w-[420px] p-8 shadow-2xl border border-white/10 backdrop-blur-xl">

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-white/5 p-3 rounded-xl border border-white/10">
<svg viewBox="0 0 120 120" className="w-full h-full -rotate-90"> 
  <title>Project ticket status distribution</title>
              <defs>
                <linearGradient id="shieldGradient" x1="0" y1="0" x2="120" y2="120">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              <path
                d="M60 10L100 30V60C100 85 80 105 60 112C40 105 20 85 20 60V30L60 10Z"
                stroke="url(#shieldGradient)"
                strokeWidth="6"
                fill="rgba(34,211,238,0.08)"
              />

              <circle
                cx="60"
                cy="60"
                r="14"
                stroke="url(#shieldGradient)"
                strokeWidth="6"
              />
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold text-white">
            Create Account
          </h2>

          <p className="text-[12px] text-gray-400 mt-1">
            Sign up to continue
          </p>
        </div>

        <div className="mb-5">
          <GoogleButton />
        </div>

        <div className="flex items-center gap-3 text-[12px] text-gray-400 mb-6">
          <div className="flex-1 border-t border-white/10" />
          or sign up with email
          <div className="flex-1 border-t border-white/10" />
        </div>

        {step === "details" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              detailsForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <detailsForm.Field name="name">
              {(field) => (
                <div>
                  <p className="text-[12px] text-gray-300 mb-2">Full Name</p>

                  <div className="flex items-center bg-[#020617] border border-white/10 rounded-lg px-3">
                    <User size={16} className="text-gray-400" />
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      className="bg-transparent w-full p-3 outline-none text-white text-[13px]"
                    />
                  </div>
                </div>
              )}
            </detailsForm.Field>

            <detailsForm.Field name="email">
              {(field) => (
                <div>
                  <p className="text-[12px] text-gray-300 mb-2">Email address</p>

                  <div className="flex items-center bg-[#020617] border border-white/10 rounded-lg px-3">
                    <Mail size={16} className="text-gray-400" />
                    <input
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="you@company.com"
                      className="bg-transparent w-full p-3 outline-none text-white text-[13px]"
                    />
                  </div>
                </div>
              )}
            </detailsForm.Field>

            <button
              type="submit"
              disabled={sendOtp.isPending}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-lg font-medium flex justify-center text-[13px]"
            >
              {sendOtp.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              otpForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <p className="text-[12px] text-gray-300 mb-2">
                Hey {submittedName}, enter the 6-digit OTP sent to
              </p>

              <p className="text-[12px] text-cyan-400 mb-3">
                {submittedEmail}
              </p>

              <otpForm.Field name="otp">
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
              </otpForm.Field>
            </div>

            <button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-medium flex justify-center text-[13px]"
            >
              {verifyOtp.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create Account"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="text-[12px] text-gray-400 hover:text-white w-full"
            >
              ← Use different email
            </button>
          </form>
        )}

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-gray-400">
            Already have an account?{" "}
            <Link
              to="/auth/signin"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
import { useSearchParams } from "react-router";
import OtpForm from "./otp-form";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const mode = (searchParams.get("mode") as "signin" | "signup" | null) ?? "signin";
  const name = searchParams.get("name") || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] px-8 py-14">
      <div className="glass-card w-[420px] p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
        
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-white/5 p-3 rounded-xl border border-white/10">
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold text-white">
            Verify OTP
          </h2>

          <p className="text-[12px] text-gray-400 mt-1">
            Enter the 6-digit OTP sent to {email}
          </p>
        </div>

        {/* OTP FORM */}
        <OtpForm email={email} mode={mode} name={name} />

      </div>
    </div>
  );
}
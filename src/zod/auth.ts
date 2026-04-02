import { z } from "zod";

/* ---------------- SEND OTP ---------------- */

export const ZSendOtpRequest = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().min(2).optional(),
});

/* ---------------- VERIFY OTP ---------------- */

export const ZVerifyOtpRequest = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api } from "@/lib/api";

type SendOtpRequest = {
    email: string;
    name?: string | undefined;
}
type VerifySignupOtpRequest = {
    email: string;
    otp: string;
    name: string;
}
type VerifySigninOtpRequest = {
    email: string;
    otp: string;
}

export const useSendSignupOtp = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Pick<SendOtpRequest, "email"> & { name: string }) =>
      api.post("/api/v1/auth/signup", { email: data.email, name: data.name }),

    onSuccess: (_, variables) => {
      const params = new URLSearchParams({
        email: variables.email,
        mode: "signup",
        name: variables.name
      });

      navigate(`/auth/verify?${params.toString()}`);
    }
  });
};

export const useSendSigninOtp = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Pick<SendOtpRequest, "email">) =>
      api.post("/api/v1/auth/signin", data),

    onSuccess: (_, variables) => {
      const params = new URLSearchParams({
        email: variables.email,
        mode: "signin",
        name: ""
      });

      navigate(`/auth/verify?${params.toString()}`);
    }
  });
};

export const useVerifySignupOtp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifySignupOtpRequest) =>
      api.post("/api/v1/auth/signup/verify", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/dashboard");
    }
  });
};

export const useVerifySigninOtp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifySigninOtpRequest) =>
      api.post("/api/v1/auth/signin/verify", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/dashboard");
    }
  });
};

export const useSignout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/api/v1/auth/signout", {});
      } catch {
        // Still clear client state if cookie/session is already gone
      }
    },
    onSettled: () => {
      localStorage.removeItem("auth");
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ["session"] });
      navigate("/auth/signin", { replace: true });
    }
  });
};
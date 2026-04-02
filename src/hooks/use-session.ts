import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me");
      if (res.status === 200) return res.data;
      return null;
    },
    retry: false,
    staleTime: 0
  });
}

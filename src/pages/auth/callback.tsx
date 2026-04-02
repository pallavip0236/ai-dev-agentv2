import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "@/hooks/use-session";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth/signin", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background mesh-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-mono">
          Authenticating...
        </p>
      </div>
    </div>
  );
}

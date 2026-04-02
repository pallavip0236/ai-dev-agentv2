import { Navigate } from "react-router";
import { useSession } from "@/hooks/use-session";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useSession();

  if (isLoading) return null;

  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

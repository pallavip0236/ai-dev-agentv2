import { Navigate } from "react-router";
import { useSession } from "@/hooks/use-session";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useSession();

  if (isLoading) return null; // or a spinner

  if (!user) return <Navigate to="/auth/signin" replace />;

  return <>{children}</>;
} 
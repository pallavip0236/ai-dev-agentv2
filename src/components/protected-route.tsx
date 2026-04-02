import { Navigate } from "react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {

  const auth = localStorage.getItem("auth");

  if (!auth) {
    return <Navigate to="/" />;
  }

  return children;
}
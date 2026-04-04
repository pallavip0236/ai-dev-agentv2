import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PublicRoute } from "@/components/auth/public-route";
import { Toaster } from "@/components/ui/sonner";

import AuthCallbackPage from "@/pages/auth/callback";
import AuthLayout from "@/pages/auth/index";
import SigninPage from "@/pages/auth/signin-form";
import SignupPage from "@/pages/auth/signup";
import VerifyPage from "@/pages/auth/verify";  

import Dashboard from "@/pages/dashboard";
import ProjectPage from "@/pages/dashboard/project/index";

// import Jira from "@/components/Jira";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* AUTH ROUTES */}
          <Route element={<AuthLayout />}>
            <Route
              path="/auth/signin"
              element={
                <PublicRoute>
                  <SigninPage />
                </PublicRoute>
              }
            />

            <Route
              path="/auth/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* ✅ OTP VERIFY ROUTE ADDED (NO LINE REMOVED) */}
            <Route
              path="/auth/verify"
              element={
                <PublicRoute>
                  <VerifyPage />
                </PublicRoute>
              }
            />
          </Route>

          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* DASHBOARD ROUTE */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="projects" element={<Dashboard />} />
            <Route path="projects/:projectId" element={<ProjectPage />} />
            {/* <Route path="jira" element={<Jira />} /> */}
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>

      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
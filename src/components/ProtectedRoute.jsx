import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import Loading from "@/components/Loading";

/** Redirects unauthenticated users to the login page. */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isAuthenticated) navigate({ to: "/", replace: true });
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) return <Loading label="Checking your session..." />;
  return children;
}
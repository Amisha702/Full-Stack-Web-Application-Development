import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ErrorMessage } from "@/components/Message";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — StockDesk Inventory Manager" },
      {
        name: "description",
        content:
          "Administrator sign in for StockDesk, a simple inventory management system for products and suppliers.",
      },
      { property: "og:title", content: "Sign in — StockDesk Inventory Manager" },
      {
        property: "og:description",
        content: "Administrator sign in for the StockDesk inventory management system.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!username.trim()) next.username = "Username is required.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      setFormError(error.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary">
            <Boxes className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">StockDesk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Inventory management admin</p>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          <div>
            <label className="field-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="field-input"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <ErrorMessage message={formError} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Credentials are verified
        </p>
      </div>
    </main>
  );
}
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/suppliers", label: "Suppliers" },
];

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Boxes className="h-5 w-5 text-primary" />
          <span>StockDesk</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm bg-accent text-accent-foreground font-medium" }}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn-outline btn-sm ml-2">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>

        <button
          className="btn-outline btn-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "rounded-md px-3 py-2.5 text-sm bg-accent text-accent-foreground font-medium" }}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn-outline mt-1 justify-start">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      )}
    </header>
  );
}
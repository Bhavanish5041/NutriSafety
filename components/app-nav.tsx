"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Activity, LayoutDashboard, Moon, ScanLine, ShieldCheck, Sun, UserCog } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/scanner", label: "Scan", icon: ScanLine },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserCog },
  { href: "/admin", label: "Admin", icon: Activity }
];

export function AppNav() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/70 backdrop-blur-2xl dark:border-emerald-900/70 dark:bg-emerald-950/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-shield-forest dark:text-emerald-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-shield-pastel">
            <ShieldCheck className="h-5 w-5" />
          </span>
          NutriShield AI
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
            </Button>
          )}
          {session?.user ? (
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

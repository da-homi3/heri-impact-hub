import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "herizon-theme";

export const applyStoredTheme = () => {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored ? stored === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", isDark);
};

const setTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
};

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  // On mount + on auth changes: pull saved preference from profile if logged in
  useEffect(() => {
    applyStoredTheme();
    setIsDark(document.documentElement.classList.contains("dark"));

    const loadProfileTheme = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("user_id", userId)
        .maybeSingle();
      const pref = (data as any)?.theme_preference as string | null | undefined;
      if (pref === "dark" || pref === "light") {
        setTheme(pref === "dark");
        setIsDark(pref === "dark");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfileTheme(session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        // defer to avoid deadlock with auth callback
        setTimeout(() => loadProfileTheme(session.user.id), 0);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const toggle = async () => {
    const next = !isDark;
    setTheme(next);
    setIsDark(next);

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: next ? "dark" : "light" } as any)
        .eq("user_id", session.user.id);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full border border-border bg-card hover:bg-secondary text-foreground transition-colors shadow-depth-sm ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-warm-gold" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
};

export default ThemeToggle;

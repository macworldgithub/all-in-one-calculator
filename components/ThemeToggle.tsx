"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "./Icons";

export type ThemeMode = "light" | "dark";

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  }
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener("theme-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("theme-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export function getClientTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("allinone_theme") === "light" ? "light" : "dark";
}

export function getServerTheme(): ThemeMode {
  return "dark";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);

  useEffect(() => {
    applyTheme(theme);

    const onCustomTheme = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail && customEvent.detail.theme) {
        localStorage.setItem("allinone_theme", customEvent.detail.theme);
        applyTheme(customEvent.detail.theme);
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: customEvent.detail.theme } }));
      }
    };
    window.addEventListener("set-theme", onCustomTheme);
    return () => window.removeEventListener("set-theme", onCustomTheme);
  }, [theme]);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    localStorage.setItem("allinone_theme", next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next } }));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Theme: ${theme.toUpperCase()} (Click to switch to ${theme === "dark" ? "light" : "dark"})`}
    >
      {theme === "dark" ? (
        <MoonIcon size={20} color="#38bdf8" />
      ) : (
        <SunIcon size={20} color="#f59e0b" />
      )}
      <span className="theme-toggle-label">{theme}</span>
    </button>
  );
}

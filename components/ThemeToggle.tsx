"use client";

import React, { useState, useEffect } from "react";
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

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("allinone_theme") as ThemeMode | null;
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyTheme(theme);

    const onCustomTheme = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail && customEvent.detail.theme) {
        setTheme(customEvent.detail.theme);
        localStorage.setItem("allinone_theme", customEvent.detail.theme);
        applyTheme(customEvent.detail.theme);
      }
    };
    window.addEventListener("set-theme", onCustomTheme);
    return () => window.removeEventListener("set-theme", onCustomTheme);
  }, [theme]);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
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

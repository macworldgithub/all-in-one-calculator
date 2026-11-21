"use client";

import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon, MonitorIcon } from "./Icons";

type ThemeMode = "light" | "dark" | "system";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  let isDark = false;
  if (mode === "dark") {
    isDark = true;
  } else if (mode === "light") {
    isDark = false;
  } else {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem("allinone_theme") as ThemeMode | null;
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });

  useEffect(() => {
    applyTheme(theme);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = localStorage.getItem("allinone_theme") as ThemeMode | null;
      if (!current || current === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const cycleTheme = () => {
    let next: ThemeMode = "dark";
    if (theme === "system") next = "dark";
    else if (theme === "dark") next = "light";
    else if (theme === "light") next = "system";

    setTheme(next);
    localStorage.setItem("allinone_theme", next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="theme-toggle-btn"
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
      title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
    >
      {theme === "dark" ? (
        <MoonIcon size={17} color="#38bdf8" />
      ) : theme === "light" ? (
        <SunIcon size={17} color="#f59e0b" />
      ) : (
        <MonitorIcon size={17} color="var(--text-secondary)" />
      )}
      <span className="theme-toggle-label">{theme}</span>
    </button>
  );
}

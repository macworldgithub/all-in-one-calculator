"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";
import {
  FinancialIcon,
  FitnessIcon,
  MathIcon,
  EverydayIcon,
  SearchIcon,
  HistoryIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
} from "./Icons";
import ThemeToggle, { applyTheme, subscribeTheme, getClientTheme, getServerTheme, type ThemeMode } from "./ThemeToggle";

const emptySubscribe = () => () => {};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const currentTheme = useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);

  // Close mobile menu on page navigation
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open, manage focus trap & Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const focusTimer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 40);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        } else if (e.key === "Tab" && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKeyDown);
      };
    }
    document.body.style.overflow = "";
  }, [mobileMenuOpen]);

  const setDrawerTheme = (mode: ThemeMode) => {
    localStorage.setItem("allinone_theme", mode);
    applyTheme(mode);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: mode } }));
  };

  const navLinks = [
    { label: "Financial", href: "/financial-calculator", icon: <FinancialIcon size={16} /> },
    { label: "Fitness & Health", href: "/fitness-and-health-calculator", icon: <FitnessIcon size={16} /> },
    { label: "Math", href: "/math-calculator", icon: <MathIcon size={16} /> },
    { label: "Other", href: "/other-calculator", icon: <EverydayIcon size={16} /> },
  ];

  const popularQuickLinks = [
    { label: "Mortgage Calculator", href: "/mortgage-calculator" },
    { label: "Loan Calculator", href: "/loan-calculator" },
    { label: "BMI Calculator", href: "/bmi-calculator" },
    { label: "Age Calculator", href: "/age-calculator" },
    { label: "Scientific Calculator", href: "/scientific-calculator" },
    { label: "Percentage Calculator", href: "/percent-calculator" },
    { label: "Grade Calculator", href: "/grade-calculator" },
  ];

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const openDrawer = (tab: "history" | "favorites" = "history") => {
    window.dispatchEvent(new CustomEvent("open-calc-drawer", { detail: { tab } }));
  };

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Brand Logo with vector SVG */}
          <Link href="/" className="header-logo" aria-label="All-in-one-calculator Home">
            <BrandLogo height={32} />
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-pill ${isActive ? "active" : ""}`}
                >
                  <span className="nav-pill-icon">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action buttons: Search, History, Theme, About, Hamburger */}
          <div className="header-actions">
            {/* Quick Search Button (opens Ctrl+K command palette) */}
            <button
              type="button"
              className="header-icon-btn header-search-trigger"
              onClick={openSearch}
              title="Search Calculators (Ctrl+K)"
              aria-label="Search all calculators"
            >
              <SearchIcon size={20} />
              <span className="header-search-text">Search</span>
              <kbd className="header-search-kbd">⌘K</kbd>
            </button>

            {/* Activity / History Drawer Button */}
            <button
              type="button"
              className="header-icon-btn header-history-btn"
              onClick={() => openDrawer("history")}
              title="Recent Calculations & Favorites"
              aria-label="Open recent calculations"
            >
              <HistoryIcon size={20} />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            <Link href="/about-us" className="header-about-link">
              About
            </Link>

            {/* Mobile Hamburger Toggle (44px x 44px touch target) */}
            <button
              ref={hamburgerRef}
              type="button"
              className={`mobile-hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-top" : ""}`}></span>
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-mid" : ""}`}></span>
              <span className={`hamburger-bar ${mobileMenuOpen ? "open-bot" : ""}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Full-Screen Drawer Rendered via Portal directly to body */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div
            className="mobile-drawer-overlay"
            onClick={() => setMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div
              ref={drawerRef}
              className="mobile-drawer-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-drawer-header">
                <span className="mobile-drawer-title">All-in-one-calculator</span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="mobile-drawer-close"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    hamburgerRef.current?.focus();
                  }}
                  aria-label="Close menu"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              {/* Mobile Quick Action Buttons (Search & History) */}
              <div className="mobile-action-bar">
                <button
                  type="button"
                  className="mobile-action-btn search-action"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSearch();
                  }}
                >
                  <SearchIcon size={18} />
                  <span>Search 200+ Calculators (⌘K)</span>
                </button>
                <button
                  type="button"
                  className="mobile-action-btn history-action"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openDrawer("history");
                  }}
                >
                  <HistoryIcon size={18} />
                  <span>Recent Calculations</span>
                </button>
              </div>

              {/* Mobile Theme Segmented Switcher */}
              <div className="mobile-theme-bar">
                <span className="mobile-theme-label">Theme:</span>
                <div className="mobile-theme-toggle-group">
                  <button
                    type="button"
                    className={`mobile-theme-btn ${currentTheme === "dark" ? "active" : ""}`}
                    onClick={() => setDrawerTheme("dark")}
                  >
                    <MoonIcon size={16} color={currentTheme === "dark" ? "#38bdf8" : "var(--text-muted)"} />
                    <span>Black Theme</span>
                  </button>
                  <button
                    type="button"
                    className={`mobile-theme-btn ${currentTheme === "light" ? "active" : ""}`}
                    onClick={() => setDrawerTheme("light")}
                  >
                    <SunIcon size={16} color={currentTheme === "light" ? "#f59e0b" : "var(--text-muted)"} />
                    <span>Light Mode</span>
                  </button>
                </div>
              </div>

              <div className="mobile-category-grid">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="mobile-category-card"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mobile-cat-icon">{link.icon}</span>
                    <span className="mobile-cat-label">{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mobile-quick-section">
                <span className="mobile-quick-title">Popular Calculators</span>
                <div className="mobile-quick-links">
                  {popularQuickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="mobile-quick-chip"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mobile-drawer-footer">
                <Link
                  href="/about-us"
                  className="mobile-footer-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/sitemap"
                  className="mobile-footer-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

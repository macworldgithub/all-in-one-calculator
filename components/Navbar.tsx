"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FinancialIcon,
  FitnessIcon,
  MathIcon,
  EverydayIcon,
  SearchIcon,
  HistoryIcon,
  CloseIcon,
} from "./Icons";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu on page navigation
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link href="/" className="header-logo" aria-label="All-in-one-calculator Home">
          <Image
            src="/img/svg/allinone-logo.svg"
            alt="All-in-one-calculator"
            width={240}
            height={34}
            priority
          />
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

        {/* Action buttons: Search, History, Theme, About */}
        <div className="header-actions">
          {/* Quick Search Button (opens Ctrl+K command palette) */}
          <button
            type="button"
            className="header-icon-btn header-search-trigger"
            onClick={openSearch}
            title="Search Calculators (Ctrl+K)"
            aria-label="Search all calculators"
          >
            <SearchIcon size={17} />
            <span className="header-search-text">Search</span>
            <kbd className="header-search-kbd">⌘K</kbd>
          </button>

          {/* Activity / History Drawer Button */}
          <button
            type="button"
            className="header-icon-btn"
            onClick={() => openDrawer("history")}
            title="Recent Calculations & Favorites"
            aria-label="Open recent calculations"
          >
            <HistoryIcon size={17} />
          </button>

          {/* Theme Toggle (Light / Dark / Auto) */}
          <ThemeToggle />

          <Link href="/about-us" className="header-about-link">
            About
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
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

      {/* Mobile & Tablet Full-Width Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">All-in-one-calculator</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Mobile Quick Action Buttons (Search & History) */}
            <div className="mobile-action-bar">
              <button
                type="button"
                className="mobile-action-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
              >
                <SearchIcon size={16} />
                <span>Quick Search (⌘K)</span>
              </button>
              <button
                type="button"
                className="mobile-action-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDrawer("history");
                }}
              >
                <HistoryIcon size={16} />
                <span>Recent History</span>
              </button>
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
        </div>
      )}
    </header>
  );
}

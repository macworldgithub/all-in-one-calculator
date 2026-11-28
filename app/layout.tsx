import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import HistoryFavoritesModal from "@/components/HistoryFavoritesModal";
import BrandLogo from "@/components/BrandLogo";
import { ShieldCheckIcon, BoltIcon, DeviceMobileIcon } from "@/components/Icons";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://all-in-one-calculator.vercel.app"
  ),
  title: "All-in-one-calculator: Free Online Calculators - Math, Fitness, Finance, Science",
  description:
    "All-in-one-calculator provides fast, accurate, and comprehensive online calculators for finance, health, fitness, math, science, and everyday needs.",
  openGraph: {
    title: "All-in-one-calculator: Free Online Calculators",
    description:
      "Fast, accurate, privacy-first online calculators for finance, health, fitness, math, science, and everyday conversions.",
    url: "/",
    siteName: "All-in-one-calculator",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "All-in-one-calculator: Free Online Calculators",
    description:
      "215+ free online calculators for finance, health, fitness, math, science, and conversions.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Script: runs synchronously before body render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('allinone_theme');
                  var isLight = theme === 'light';
                  if (isLight) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Navbar />

        <div id="main-content" tabIndex={-1} style={{ flex: "1 0 auto", minWidth: 0 }}>
          {children}
        </div>

        {/* Global Modals: Command Palette (Ctrl+K) & History Drawer */}
        <CommandPalette />
        <HistoryFavoritesModal />

        {/* Modern Minimalist Footer */}
        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-grid">
              {/* Brand & Mission */}
              <div className="footer-col brand-col">
                <Link href="/" className="footer-logo" aria-label="All-in-one-calculator">
                  <BrandLogo height={32} />
                </Link>
                <p className="footer-tagline">
                  Free, instant, and privacy-first calculation tools built for everyone. No logins, no tracking, and 100% accurate.
                </p>
                <div className="footer-badges">
                  <span className="footer-badge">
                    <ShieldCheckIcon size={14} color="#059669" />
                    <span>Privacy First</span>
                  </span>
                  <span className="footer-badge">
                    <BoltIcon size={14} color="#2563eb" />
                    <span>Instant Math</span>
                  </span>
                  <span className="footer-badge">
                    <DeviceMobileIcon size={14} color="#7c3aed" />
                    <span>All Devices</span>
                  </span>
                </div>
              </div>

              {/* Finance */}
              <div className="footer-col">
                <h2 className="footer-heading">
                  <Link href="/financial-calculator">Financial</Link>
                </h2>
                <ul className="footer-links">
                  <li><Link href="/mortgage-calculator">Mortgage Calculator</Link></li>
                  <li><Link href="/loan-calculator">Loan Calculator</Link></li>
                  <li><Link href="/auto-loan-calculator">Auto Loan Calculator</Link></li>
                  <li><Link href="/interest-calculator">Interest Calculator</Link></li>
                  <li><Link href="/payment-calculator">Payment Calculator</Link></li>
                  <li><Link href="/retirement-calculator">Retirement Calculator</Link></li>
                </ul>
              </div>

              {/* Health */}
              <div className="footer-col">
                <h2 className="footer-heading">
                  <Link href="/fitness-and-health-calculator">Fitness &amp; Health</Link>
                </h2>
                <ul className="footer-links">
                  <li><Link href="/bmi-calculator">BMI Calculator</Link></li>
                  <li><Link href="/calorie-calculator">Calorie Calculator</Link></li>
                  <li><Link href="/body-fat-calculator">Body Fat Calculator</Link></li>
                  <li><Link href="/bmr-calculator">BMR Calculator</Link></li>
                  <li><Link href="/ideal-weight-calculator">Ideal Weight</Link></li>
                  <li><Link href="/pace-calculator">Pace Calculator</Link></li>
                </ul>
              </div>

              {/* Math & Other */}
              <div className="footer-col">
                <h2 className="footer-heading">
                  <Link href="/math-calculator">Math &amp; Tools</Link>
                </h2>
                <ul className="footer-links">
                  <li><Link href="/scientific-calculator">Scientific Calculator</Link></li>
                  <li><Link href="/fraction-calculator">Fraction Calculator</Link></li>
                  <li><Link href="/percent-calculator">Percentage Calculator</Link></li>
                  <li><Link href="/age-calculator">Age Calculator</Link></li>
                  <li><Link href="/date-calculator">Date Calculator</Link></li>
                  <li><Link href="/time-calculator">Time Calculator</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
              <div className="footer-copyright">
                &copy; 2008 &ndash; 2026 <strong>All-in-one-calculator</strong>. All rights reserved.
              </div>
              <div className="footer-nav-links">
                <Link href="/about-us">About Us</Link>
                <span className="dot">&bull;</span>
                <Link href="/sitemap">Sitemap</Link>
                <span className="dot">&bull;</span>
                <Link href="/about-us#terms">Terms of Use</Link>
                <span className="dot">&bull;</span>
                <Link href="/about-us#privacy">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </footer>

        <Script src="/js/common.js" strategy="afterInteractive" />
        <Script src="/js/loannew.js" strategy="afterInteractive" />
        <Script src="/js/quick-conversion.js" strategy="afterInteractive" />
        <Script src="/js/calc-engines.js" strategy="afterInteractive" />
        <Script
          id="pwa-sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

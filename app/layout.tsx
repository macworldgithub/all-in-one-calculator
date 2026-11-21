import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { ShieldCheckIcon, BoltIcon, DeviceMobileIcon } from "@/components/Icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "All-in-one-calculator: Free Online Calculators - Math, Fitness, Finance, Science",
  description:
    "All-in-one-calculator provides fast, accurate, and comprehensive online calculators for finance, health, fitness, math, science, and everyday needs.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}

        {/* Modern Minimalist Footer */}
        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-grid">
              {/* Brand & Mission */}
              <div className="footer-col brand-col">
                <Link href="/" className="footer-logo">
                  <Image
                    src="/img/svg/allinone-logo.svg"
                    width={220}
                    height={32}
                    alt="All-in-one-calculator"
                  />
                </Link>
                <p className="footer-desc">
                  All-in-one-calculator provides fast, comprehensive, and 100% free online calculators across finance, health, fitness, math, and everyday tools. No signup or download required.
                </p>
                <div className="footer-badge-row">
                  <span className="footer-badge">
                    <ShieldCheckIcon size={14} color="#059669" />
                    <span>100% Free</span>
                  </span>
                  <span className="footer-badge">
                    <BoltIcon size={14} color="#2563eb" />
                    <span>Instant Math</span>
                  </span>
                  <span className="footer-badge">
                    <DeviceMobileIcon size={14} color="#7c3aed" />
                    <span>All Screens</span>
                  </span>
                </div>
              </div>

              {/* Financial */}
              <div className="footer-col">
                <h4 className="footer-heading">
                  <Link href="/financial-calculator">Financial</Link>
                </h4>
                <ul className="footer-links">
                  <li><Link href="/mortgage-calculator">Mortgage Calculator</Link></li>
                  <li><Link href="/loan-calculator">Loan Calculator</Link></li>
                  <li><Link href="/auto-loan-calculator">Auto Loan Calculator</Link></li>
                  <li><Link href="/interest-calculator">Interest Calculator</Link></li>
                  <li><Link href="/retirement-calculator">Retirement Calculator</Link></li>
                  <li><Link href="/amortization-calculator">Amortization Calculator</Link></li>
                </ul>
              </div>

              {/* Fitness & Health */}
              <div className="footer-col">
                <h4 className="footer-heading">
                  <Link href="/fitness-and-health-calculator">Fitness &amp; Health</Link>
                </h4>
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
                <h4 className="footer-heading">
                  <Link href="/math-calculator">Math &amp; Tools</Link>
                </h4>
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
        <Script src="/js/calc-engines.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

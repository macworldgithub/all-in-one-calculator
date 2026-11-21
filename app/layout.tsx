import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "All In One Calculator: Free Online Calculators - Math, Fitness, Finance, Science",
  description:
    "Online calculator for quick calculations, along with a large collection of calculators on math, finance, fitness, and more, each with in-depth information.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/css/sci.css" />
      </head>
      <body>
        <div id="headerout">
          <div id="header">
            <div id="logo">
              <Link href="/">
                <img
                  src="/img/svg/allinone-logo.svg"
                  width={220}
                  height={34}
                  alt="All In One Calculator"
                />
              </Link>
            </div>
            <nav className="topNavAbs">
              <Link href="/financial-calculator">Financial</Link>
              <Link href="/fitness-and-health-calculator">Fitness &amp; Health</Link>
              <Link href="/math-calculator">Math</Link>
              <Link href="/other-calculator">Other</Link>
            </nav>
            <div id="login">
              <Link href="/about-us">About</Link>
            </div>
          </div>
        </div>

        {children}

        <div id="footer">
          <div id="footerin">
            All In One Calculator&apos;s sole focus is to provide fast, comprehensive,
            convenient, free online calculators in a plethora of areas.
            Currently, we have around 200 calculators to help you &quot;do the
            math&quot; quickly in areas such as finance, fitness, health, math,
            and others, and we are still developing more. Our goal is to become
            the one-stop, go-to site for people who need to make quick
            calculations. Additionally, we believe the internet should be a
            source of free information. Therefore, all of our tools and services
            are completely free, with no registration required.
            <br />
            <br />
            We coded and developed each calculator individually and put each one
            through strict, comprehensive testing. However, please inform us if
            you notice even the slightest error &ndash; your input is extremely
            valuable to us. While most calculators on All In One Calculator are designed
            to be universally applicable for worldwide usage, some are for
            specific countries only. For example, the <i>Income Tax Calculator</i>{" "}
            is for United States residents only.
            <br />
            <br />
            <div id="footernav">
              <Link href="/about-us">about us</Link> |{" "}
              <Link href="/sitemap">sitemap</Link> |{" "}
              <Link href="/about-us#terms">terms of use</Link> |{" "}
              <Link href="/about-us#privacy">privacy policy</Link> &nbsp; &copy; 2008
              - 2026 <Link href="/">all in one calculator</Link>
            </div>
          </div>
        </div>

        <Script src="/js/common.js" strategy="afterInteractive" />
        <Script src="/js/calc-engines.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

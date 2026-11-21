import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { SparklesIcon } from "@/components/Icons";

export const metadata = {
  title: "About Us - All-in-one-calculator",
  description: "About All-in-one-calculator, our mission, contact details, terms of service, and privacy policy.",
};

export default function AboutUsPage() {
  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <article className="calc-main-content">
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">About Us</span>
          </nav>

          <header className="hub-header">
            <div className="hub-badge">
              <SparklesIcon size={14} color="var(--color-primary)" />
              <span>About All-in-one-calculator</span>
            </div>
            <h1 className="hub-title">About All-in-one-calculator</h1>
            <p className="hub-subtitle">
              We provide fast, comprehensive, convenient, and 100% free online calculators in finance, health, fitness, math, and everyday tools.
            </p>
          </header>

          <div className="modern-article-card">
            <h2>Our Mission</h2>
            <p>
              The main purpose of <strong>All-in-one-calculator</strong> is to provide a comprehensive collection of free online calculators for the general public, students, engineers, and professionals worldwide. All tools are coded with precision, tested against industry benchmarks, and are 100% free to use with no account, subscription, or software installation needed.
            </p>

            <h2>Calculator Categories</h2>
            <p>
              Calculators are organized into four core categories:
            </p>
            <ul>
              <li><strong><Link href="/financial-calculator">Financial Calculators</Link></strong>: Over 70 tools covering mortgages, amortizations, auto loans, investments, taxes, and retirement plans. Reviewed by financial specialists.</li>
              <li><strong><Link href="/fitness-and-health-calculator">Fitness &amp; Health Calculators</Link></strong>: Over 30 tools for calculating BMI, daily caloric needs, body fat, ideal weight, pace, and pregnancy milestones.</li>
              <li><strong><Link href="/math-calculator">Math &amp; Science Calculators</Link></strong>: Over 40 tools including our full-featured scientific calculator, fractions, percentages, geometry, and statistics engines.</li>
              <li><strong><Link href="/other-calculator">Other &amp; Everyday Calculators</Link></strong>: Over 60 tools for calculating age, date intervals, GPA, concrete volumes, conversions, and security utilities.</li>
            </ul>

            <h2 id="faq">Frequently Asked Questions</h2>
            <div className="faq-block">
              <h3>Q: Can I link to any calculator on All-in-one-calculator?</h3>
              <p>A: Yes! You are welcome to link directly to any calculator or page on All-in-one-calculator.</p>

              <h3>Q: How can I send feedback or suggest new calculators?</h3>
              <p>A: We actively maintain all calculations and welcome feature suggestions and bug reports. Please reach out to us at support@all-in-one-calculator.com.</p>

              <h3>Q: Do you charge for any of these calculators?</h3>
              <p>A: No. Every tool and feature on All-in-one-calculator is 100% free and open to everyone.</p>
            </div>

            <h2 id="privacy">Privacy Policy</h2>
            <p>
              At <strong>All-in-one-calculator</strong>, we respect your privacy. We do not require accounts or logins to use our calculation engines. Calculations run locally in your web browser. Standard web server logs (IP address, browser type, timestamps) are maintained solely for security and performance diagnostics.
            </p>

            <h2 id="terms">Terms of Use</h2>
            <p>
              All calculation tools and informational content on <strong>All-in-one-calculator</strong> are provided for informational and educational purposes. While we strive for extreme mathematical precision and cross-verify algorithms against standard textbooks and financial/medical formulas, calculations should not replace professional financial, medical, or legal counsel.
            </p>
          </div>
        </article>

        <aside className="calc-sidebar-aside">
          <Sidebar category="financial" categoryTitle="Explore Calculators" />
        </aside>
      </div>
    </main>
  );
}

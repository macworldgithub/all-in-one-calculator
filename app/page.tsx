import React from "react";
import ScientificCalculator from "@/components/ScientificCalculator";
import SearchBox from "@/components/SearchBox";
import CategoryTiles from "@/components/CategoryTiles";
import Link from "next/link";
import {
  SparklesIcon,
  HomeIcon,
  CreditCardIcon,
  ScaleIcon,
  FlameIcon,
  CalendarIcon,
  MathIcon,
  PercentIcon,
} from "@/components/Icons";

export default function HomePage() {
  return (
    <main className="main-wrapper">
      {/* Hero Section with Modern 2-Column Responsive Layout (NO tables) */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Column: Heading, Subtitle & Search */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <SparklesIcon size={14} color="var(--color-primary)" />
              <span>Free &amp; Instant Calculations</span>
            </div>
            <h1 className="hero-title">
              All-in-one<span className="hero-title-accent">-calculator</span>
            </h1>
            <p className="hero-subtitle">
              Fast, comprehensive, and accurate online calculators for finance,
              fitness, health, math, and everyday decisions. No account or
              download required.
            </p>

            <div className="hero-search-wrapper">
              <SearchBox alignCenter={false} />
            </div>

            {/* Feature highlights */}
            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Calculators</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Free Forever</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">0s</span>
                <span className="stat-label">Instant Math</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Modern Calculator */}
          <div className="hero-calculator">
            <div className="calc-frame-header">
              <span className="calc-frame-title">Smart Calculator</span>
              <span className="calc-frame-badge">Keyboard Ready</span>
            </div>
            <ScientificCalculator />
          </div>
        </div>
      </section>

      {/* Popular Fast Access Categories */}
      <section className="popular-bar-section">
        <div className="popular-bar-container">
          <span className="popular-bar-label">Trending Now:</span>
          <div className="popular-bar-chips">
            <Link href="/mortgage-calculator" className="popular-chip">
              <HomeIcon size={14} />
              <span>Mortgage</span>
            </Link>
            <Link href="/loan-calculator" className="popular-chip">
              <CreditCardIcon size={14} />
              <span>Loan</span>
            </Link>
            <Link href="/bmi-calculator" className="popular-chip">
              <ScaleIcon size={14} />
              <span>BMI</span>
            </Link>
            <Link href="/calorie-calculator" className="popular-chip">
              <FlameIcon size={14} />
              <span>Calorie</span>
            </Link>
            <Link href="/age-calculator" className="popular-chip">
              <CalendarIcon size={14} />
              <span>Age</span>
            </Link>
            <Link href="/scientific-calculator" className="popular-chip">
              <MathIcon size={14} />
              <span>Scientific</span>
            </Link>
            <Link href="/percent-calculator" className="popular-chip">
              <PercentIcon size={14} />
              <span>Percentage</span>
            </Link>
            <Link href="/date-calculator" className="popular-chip">
              <CalendarIcon size={14} />
              <span>Date</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Categories & All Calculators */}
      <CategoryTiles />
    </main>
  );
}

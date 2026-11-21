import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getCalculatorsIndex } from "@/lib/calculators";
import { FitnessIcon } from "@/components/Icons";

export const metadata = {
  title: "Fitness & Health Calculators - All-in-one-calculator",
  description:
    "Free health and fitness calculators including BMI, Calorie, Body Fat, BMR, Pace, and Pregnancy on All-in-one-calculator.",
};

export default function FitnessCalculatorPage() {
  const allCalcs = getCalculatorsIndex();
  const healthCalcs = allCalcs.filter(
    (c) => c.category === "fitness-and-health"
  );

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <div className="calc-main-content">
          {/* Breadcrumbs */}
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Fitness &amp; Health</span>
          </nav>

          {/* Hub Header */}
          <header className="hub-header">
            <div className="hub-badge">
              <FitnessIcon size={14} color="#059669" />
              <span>32 Health &amp; Fitness Tools</span>
            </div>
            <h1 className="hub-title">Fitness &amp; Health Calculators</h1>
            <p className="hub-subtitle">
              Track your wellness goals, calculate daily caloric needs, body fat percentage, ideal weight, BMI, running pace, and pregnancy milestones.
            </p>
          </header>

          {/* Cards Grid */}
          <div className="hub-grid">
            {healthCalcs.map((calc) => (
              <Link
                key={calc.slug}
                href={`/${calc.slug}`}
                className="hub-calc-card"
              >
                <div className="hub-calc-title-row">
                  <h3 className="hub-calc-title">{calc.title}</h3>
                  <span className="hub-calc-arrow">&rarr;</span>
                </div>
                {calc.description && (
                  <p className="hub-calc-desc">{calc.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>

        <aside className="calc-sidebar-aside">
          <Sidebar category="fitness-and-health" categoryTitle="Health &amp; Fitness Calculators" />
        </aside>
      </div>
    </main>
  );
}

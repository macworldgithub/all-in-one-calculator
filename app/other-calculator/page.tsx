import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getCalculatorsIndex } from "@/lib/calculators";
import { EverydayIcon } from "@/components/Icons";

export const metadata = {
  title: "Other & Everyday Calculators - All-in-one-calculator",
  description:
    "Free everyday calculators for age, dates, time, GPA, grade calculation, concrete, conversions, and password generation on All-in-one-calculator.",
};

export default function OtherCalculatorPage() {
  const allCalcs = getCalculatorsIndex();
  const otherCalcs = allCalcs.filter(
    (c) => c.category === "other"
  );

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <div className="calc-main-content">
          {/* Breadcrumbs */}
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Other Tools</span>
          </nav>

          {/* Hub Header */}
          <header className="hub-header">
            <div className="hub-badge">
              <EverydayIcon size={14} color="#d97706" />
              <span>62 Everyday Tools</span>
            </div>
            <h1 className="hub-title">Other &amp; Everyday Calculators</h1>
            <p className="hub-subtitle">
              Tools for daily life, productivity, and construction. Calculate exact age, date intervals, hours worked, GPA, grades, concrete volume, unit conversions, and more.
            </p>
          </header>

          {/* Cards Grid */}
          <div className="hub-grid">
            {otherCalcs.map((calc) => (
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
          <Sidebar category="other" categoryTitle="Everyday &amp; Other Calculators" />
        </aside>
      </div>
    </main>
  );
}

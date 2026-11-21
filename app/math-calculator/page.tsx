import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getCalculatorsIndex } from "@/lib/calculators";

export const metadata = {
  title: "Math Calculators - All-in-one-calculator",
  description:
    "Free math calculators for scientific calculations, fractions, percentages, geometry, statistics, and algebra on All-in-one-calculator.",
};

export default function MathCalculatorPage() {
  const allCalcs = getCalculatorsIndex();
  const mathCalcs = allCalcs.filter(
    (c) => c.category === "math"
  );

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <div className="calc-main-content">
          {/* Breadcrumbs */}
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Math</span>
          </nav>

          {/* Hub Header */}
          <header className="hub-header">
            <div className="hub-badge">📐 45 Math &amp; Science Tools</div>
            <h1 className="hub-title">Math Calculators</h1>
            <p className="hub-subtitle">
              Solve complex mathematical formulas, perform scientific computations, calculate percentages, fractions, standard deviations, and geometric properties.
            </p>
          </header>

          {/* Cards Grid */}
          <div className="hub-grid">
            {mathCalcs.map((calc) => (
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
          <Sidebar category="math" categoryTitle="Math Calculators" />
        </aside>
      </div>
    </main>
  );
}

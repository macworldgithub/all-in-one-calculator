import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getCalculatorsIndex } from "@/lib/calculators";

export const metadata = {
  title: "Financial Calculators - All-in-one-calculator",
  description:
    "Comprehensive suite of 70+ free financial calculators for mortgages, loans, investments, taxes, retirement, and personal finances on All-in-one-calculator.",
};

export default function FinancialCalculatorPage() {
  const allCalcs = getCalculatorsIndex();
  const financialCalcs = allCalcs.filter(
    (c) => c.category === "financial"
  );

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <div className="calc-main-content">
          {/* Breadcrumbs */}
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Financial</span>
          </nav>

          {/* Hub Header */}
          <header className="hub-header">
            <div className="hub-badge">💰 76 Financial Tools</div>
            <h1 className="hub-title">Financial Calculators</h1>
            <p className="hub-subtitle">
              Make confident financial decisions with accurate calculators for mortgages, auto loans, investments, retirement, income taxes, and debt management.
            </p>
          </header>

          {/* Cards Grid */}
          <div className="hub-grid">
            {financialCalcs.map((calc) => (
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
          <Sidebar category="financial" categoryTitle="Financial Calculators" />
        </aside>
      </div>
    </main>
  );
}

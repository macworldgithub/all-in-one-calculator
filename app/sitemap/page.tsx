import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getCalculatorsIndex } from "@/lib/calculators";

export const metadata = {
  title: "Sitemap - All-in-one-calculator",
  description: "Complete sitemap for All-in-one-calculator: all 200+ calculators categorized by Finance, Fitness, Math, and Everyday tools.",
};

export default function SitemapPage() {
  const allCalcs = getCalculatorsIndex();

  const categories = [
    { key: "financial", title: "Financial Calculators", href: "/financial-calculator", icon: "💰" },
    { key: "fitness-and-health", title: "Fitness & Health Calculators", href: "/fitness-and-health-calculator", icon: "💪" },
    { key: "math", title: "Math Calculators", href: "/math-calculator", icon: "📐" },
    { key: "other", title: "Other & Everyday Calculators", href: "/other-calculator", icon: "⚡" },
  ];

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <article className="calc-main-content">
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Sitemap</span>
          </nav>

          <header className="hub-header">
            <div className="hub-badge">📑 Directory</div>
            <h1 className="hub-title">Complete Calculator Sitemap</h1>
            <p className="hub-subtitle">
              Browse all 200+ free online calculators organized by subject and practical use case.
            </p>
          </header>

          <div className="sitemap-sections">
            {categories.map((cat) => {
              const calcsInCat = allCalcs.filter((c) => c.category === cat.key);
              return (
                <section key={cat.key} className="sitemap-cat-card">
                  <div className="sitemap-cat-header">
                    <span className="sitemap-cat-icon">{cat.icon}</span>
                    <h2 className="sitemap-cat-title">
                      <Link href={cat.href}>{cat.title}</Link>
                    </h2>
                    <span className="sitemap-cat-count">{calcsInCat.length} tools</span>
                  </div>
                  <div className="sitemap-links-grid">
                    {calcsInCat.map((calc) => (
                      <Link key={calc.slug} href={`/${calc.slug}`} className="sitemap-link">
                        {calc.title}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </article>

        <aside className="calc-sidebar-aside">
          <Sidebar category="financial" categoryTitle="Explore Calculators" />
        </aside>
      </div>
    </main>
  );
}

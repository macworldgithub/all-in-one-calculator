import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ScientificCalculator from "@/components/ScientificCalculator";
import { getCalculatorsIndex, getCalculatorBySlug } from "@/lib/calculators";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const list = getCalculatorsIndex();
  return list.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalculatorBySlug(slug);

  if (!calc) {
    return {
      title: "Page Not Found - All-in-one-calculator",
    };
  }

  return {
    title: `${calc.title} - All-in-one-calculator`,
    description: calc.description || `${calc.title} on All-in-one-calculator`,
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = getCalculatorBySlug(slug);

  if (!calc) {
    notFound();
  }

  const isScientific = slug === "scientific-calculator";

  const getCatUrl = (category: string) => {
    if (category === "fitness-and-health") return "/fitness-and-health-calculator";
    if (category === "math") return "/math-calculator";
    if (category === "other") return "/other-calculator";
    return "/financial-calculator";
  };

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <article className="calc-main-content">
          {isScientific ? (
            <div>
              <nav className="modern-breadcrumbs">
                <Link href="/">Home</Link>
                <span className="crumb-sep">/</span>
                <Link href={getCatUrl(calc.category)}>{calc.categoryTitle || "Math"}</Link>
                <span className="crumb-sep">/</span>
                <span className="crumb-current">{calc.title}</span>
              </nav>

              <header className="hub-header" style={{ marginBottom: "22px" }}>
                <div className="hub-badge">🔬 Precision Math</div>
                <h1 className="hub-title">{calc.title}</h1>
                <p className="hub-subtitle">
                  High-precision online scientific calculator supporting standard arithmetic, trigonometry (Deg/Rad), logarithms, factorials, roots, powers, and full physical keyboard input.
                </p>
              </header>

              <div style={{ maxWidth: "560px", margin: "0 auto 36px" }}>
                <ScientificCalculator />
              </div>
            </div>
          ) : (
            <div
              id="content"
              className="calc-body-html"
              dangerouslySetInnerHTML={{ __html: calc.html }}
            />
          )}
        </article>

        <aside className="calc-sidebar-aside">
          <Sidebar category={calc.category} categoryTitle={calc.categoryTitle} />
        </aside>
      </div>
    </main>
  );
}

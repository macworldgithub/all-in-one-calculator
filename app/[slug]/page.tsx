import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
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

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <article className="calc-main-content">
          <div
            id="content"
            className="calc-body-html"
            dangerouslySetInnerHTML={{ __html: calc.html }}
          />
        </article>

        <aside className="calc-sidebar-aside">
          <Sidebar category={calc.category} categoryTitle={calc.categoryTitle} />
        </aside>
      </div>
    </main>
  );
}

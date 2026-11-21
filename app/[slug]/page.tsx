import React from "react";
import Link from "next/link";
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
      title: "Page Not Found - Calculator.net",
    };
  }

  return {
    title: `${calc.title} - Calculator.net`,
    description: calc.description || `${calc.title} on Calculator.net`,
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = getCalculatorBySlug(slug);

  if (!calc) {
    notFound();
  }

  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div
          id="content"
          dangerouslySetInnerHTML={{ __html: calc.html }}
        />
        <Sidebar category={calc.category} categoryTitle={calc.categoryTitle} />
      </div>
      <div id="clear"></div>

      <div className="topNavAbs">
        <Link
          href="/financial-calculator"
          className={calc.category === "financial" ? "topNavOn" : ""}
        >
          Financial
        </Link>
        <Link
          href="/fitness-and-health-calculator"
          className={calc.category === "fitness-and-health" ? "topNavOn" : ""}
        >
          Fitness &amp; Health
        </Link>
        <Link
          href="/math-calculator"
          className={calc.category === "math" ? "topNavOn" : ""}
        >
          Math
        </Link>
        <Link
          href="/other-calculator"
          className={calc.category === "other" ? "topNavOn" : ""}
        >
          Other
        </Link>
      </div>
    </>
  );
}

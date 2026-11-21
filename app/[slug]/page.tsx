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
      title: "Page Not Found - All In One Calculator",
    };
  }

  return {
    title: `${calc.title} - All In One Calculator`,
    description: calc.description || `${calc.title} on All In One Calculator`,
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
    </>
  );
}

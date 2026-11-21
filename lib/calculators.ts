import fs from "fs";
import path from "path";

export interface CalculatorSummary {
  slug: string;
  title: string;
  h1: string;
  category: string;
  categoryTitle: string;
  description: string;
}

export interface CalculatorItem extends CalculatorSummary {
  html: string;
}

let cachedIndex: CalculatorSummary[] | null = null;

export function getCalculatorsIndex(): CalculatorSummary[] {
  if (!cachedIndex) {
    const indexPath = path.join(process.cwd(), "data", "calculators-index.json");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      cachedIndex = JSON.parse(content);
    } else {
      cachedIndex = [];
    }
  }
  return cachedIndex!;
}

export function getCalculatorBySlug(slug: string): CalculatorItem | undefined {
  try {
    const filePath = path.join(process.cwd(), "data", "calculators", `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Failed to load calculator ${slug}`, e);
  }
  return undefined;
}

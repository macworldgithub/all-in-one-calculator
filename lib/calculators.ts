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
let cachedSlugSet: Set<string> | null = null;
const SAFE_SLUG_RE = /^[a-z0-9-]+$/;

export function getCalculatorsIndex(): CalculatorSummary[] {
  if (!cachedIndex) {
    const indexPath = path.join(process.cwd(), "data", "calculators-index.json");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      cachedIndex = JSON.parse(content);
      cachedSlugSet = new Set((cachedIndex || []).map((item) => item.slug));
    } else {
      cachedIndex = [];
      cachedSlugSet = new Set();
    }
  }
  return cachedIndex!;
}

export function getCalculatorBySlug(slug: string): CalculatorItem | undefined {
  if (!slug || !SAFE_SLUG_RE.test(slug)) {
    return undefined;
  }
  getCalculatorsIndex();
  if (cachedSlugSet && cachedSlugSet.size > 0 && !cachedSlugSet.has(slug)) {
    return undefined;
  }
  try {
    const baseDir = path.resolve(process.cwd(), "data", "calculators");
    const filePath = path.resolve(baseDir, `${slug}.json`);
    if (!filePath.startsWith(baseDir + path.sep)) {
      return undefined;
    }
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Failed to load calculator ${slug}`, e);
  }
  return undefined;
}

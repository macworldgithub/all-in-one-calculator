import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container" style={{ maxWidth: "820px" }}>
        <article className="modern-article-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Error 404
          </p>
          <h1 className="hub-title" style={{ marginTop: "8px", marginBottom: "12px" }}>
            Calculator Page Not Found
          </h1>
          <p className="hub-subtitle" style={{ maxWidth: "520px", margin: "0 auto 24px" }}>
            The tool or page you requested could not be found. Search all 200+ calculators below or browse by category.
          </p>

          <div style={{ marginBottom: "28px" }}>
            <SearchBox alignCenter />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
            <Link href="/" className="popular-chip">
              Home
            </Link>
            <Link href="/financial-calculator" className="popular-chip">
              Financial Calculators
            </Link>
            <Link href="/fitness-and-health-calculator" className="popular-chip">
              Fitness &amp; Health
            </Link>
            <Link href="/math-calculator" className="popular-chip">
              Math &amp; Science
            </Link>
            <Link href="/other-calculator" className="popular-chip">
              Other Calculators
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

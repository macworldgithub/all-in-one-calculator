"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container" style={{ maxWidth: "720px" }}>
        <section className="modern-article-card" style={{ textAlign: "center", padding: "44px 24px" }}>
          <h1 className="hub-title" style={{ marginBottom: "10px" }}>
            Something went wrong
          </h1>
          <p className="hub-subtitle" style={{ marginBottom: "24px" }}>
            We hit an unexpected issue rendering this page. You can retry safely or return to the calculator directory.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={reset} className="deck-more-btn">
              Try Again
            </button>
            <Link href="/" className="popular-chip">
              Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

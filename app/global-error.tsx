"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "40px 16px", textAlign: "center" }}>
        <main style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h1>Unexpected Application Error</h1>
          <p>Please refresh or try again to restore All-in-one-calculator.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </main>
      </body>
    </html>
  );
}

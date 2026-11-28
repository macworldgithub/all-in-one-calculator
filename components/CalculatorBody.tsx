"use client";

import React, { useEffect, useRef, useState } from "react";

interface CalculatorBodyProps {
  slug: string;
  cleanHtml: string;
  inlineScripts: string[];
  externalScripts: string[];
}

export default function CalculatorBody({
  slug,
  cleanHtml,
  inlineScripts,
  externalScripts,
}: CalculatorBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const injectedNodes: HTMLScriptElement[] = [];

    // Ensure all large inline SVGs scale cleanly on narrow screens
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      if (!svg.getAttribute("viewBox")) {
        const w = parseFloat(svg.getAttribute("width") || "0");
        const h = parseFloat(svg.getAttribute("height") || "0");
        if (w > 0 && h > 0) {
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
      }
    });

    const loadExternalScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
      });
    };

    const runScripts = async () => {
      // Wait for core afterInteractive scripts (common.js + calc-engines.js)
      const w = window as unknown as {
        gObj?: unknown;
        runCalculator?: unknown;
        prepareCalculatorMount?: (s: string) => void;
        onCalculatorMount?: (s: string) => void;
      };
      let attempts = 0;
      while ((typeof w.gObj !== "function" || typeof w.runCalculator !== "function") && attempts < 100) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 60));
        attempts++;
      }
      if (cancelled) return;

      if (typeof w.gObj !== "function" || typeof w.runCalculator !== "function") {
        setLoadError(true);
        return;
      }
      setLoadError(false);

      if (typeof w.prepareCalculatorMount === "function") {
        try {
          w.prepareCalculatorMount(slug);
        } catch (err) {
          console.error(`prepareCalculatorMount error in ${slug}:`, err);
        }
      }

      for (const src of externalScripts) {
        if (cancelled) return;
        await loadExternalScript(src);
      }

      if (cancelled) return;

      for (const code of inlineScripts) {
        if (!code || !code.trim()) continue;
        try {
          const s = document.createElement("script");
          s.text = code;
          container.appendChild(s);
          injectedNodes.push(s);
        } catch (err) {
          console.error(`Inline script error in ${slug}:`, err);
        }
      }

      if (typeof w.onCalculatorMount === "function") {
        try {
          w.onCalculatorMount(slug);
        } catch (err) {
          console.error(`onCalculatorMount error in ${slug}:`, err);
        }
      }
    };

    runScripts();

    return () => {
      cancelled = true;
      injectedNodes.forEach((node) => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });
      // Clean up legacy hover tooltips across route transitions
      const svgTip = document.getElementById("ttvsbartt");
      if (svgTip) svgTip.style.display = "none";
      const textTip = document.getElementById("tt");
      if (textTip) textTip.style.display = "none";
    };
  }, [slug, cleanHtml, inlineScripts, externalScripts, retryCount]);

  return (
    <>
      {loadError && (
        <div
          role="alert"
          style={{
            marginBottom: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "14px" }}>
            Calculation engine scripts took too long to load.
          </span>
          <button
            type="button"
            onClick={() => {
              setLoadError(false);
              setRetryCount((c) => c + 1);
            }}
            className="popular-chip"
          >
            Retry
          </button>
        </div>
      )}
      <div
        id="content"
        ref={containerRef}
        className="calc-body-html"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </>
  );
}

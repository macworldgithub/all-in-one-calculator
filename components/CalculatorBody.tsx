"use client";

import React, { useEffect, useRef } from "react";

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
      while ((typeof w.gObj !== "function" || typeof w.runCalculator !== "function") && attempts < 60) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
      if (cancelled) return;

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
    };
  }, [slug, cleanHtml, inlineScripts, externalScripts]);

  return (
    <div
      id="content"
      ref={containerRef}
      className="calc-body-html"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

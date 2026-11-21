"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import searchIndex from "@/data/search-index.json";

interface SearchItem {
  name: string;
  url: string;
  category?: string;
}

interface SearchBoxProps {
  alignCenter?: boolean;
}

export default function SearchBox({ alignCenter = false }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const results =
    q.length > 0
      ? (searchIndex as SearchItem[])
          .filter((item) => item.name.toLowerCase().includes(q))
          .slice(0, 8)
      : [];

  const isOpen = isFocused && q.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        textAlign: alignCenter ? "center" : "left",
        width: "100%",
        maxWidth: "460px",
        margin: alignCenter ? "0 auto" : "0",
      }}
    >
      <form
        name="calcSearchForm"
        onSubmit={(e) => e.preventDefault()}
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            border: isFocused ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
            borderRadius: "12px",
            boxShadow: isFocused
              ? "0 0 0 4px rgba(37, 99, 235, 0.12)"
              : "0 2px 4px rgba(0, 0, 0, 0.04)",
            padding: "4px 6px 4px 14px",
            transition: "all 0.15s ease",
          }}
        >
          {/* Search Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginRight: "8px" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            name="calcSearchTerm"
            id="calcSearchTerm"
            placeholder="Search all 200+ calculators (e.g. mortgage, BMI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              padding: "8px 4px",
              color: "#0f172a",
              background: "transparent",
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsFocused(false);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "4px",
                marginRight: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              ✕
            </button>
          )}

          <button
            type="submit"
            id="bluebtn"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
            }}
          >
            Search
          </button>
        </div>

        {/* Autocomplete Results Card */}
        {isOpen && (
          <div
            id="calcSearchOut"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              zIndex: 100,
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
              textAlign: "left",
              overflow: "hidden",
            }}
          >
            {results.length > 0 ? (
              results.map((r) => (
                <Link
                  key={r.url}
                  href={r.url}
                  onClick={() => setIsFocused(false)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    color: "#0f172a",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffffff")
                  }
                >
                  <span>{r.name}</span>
                  {r.category && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.category}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <div
                style={{
                  padding: "14px",
                  fontSize: "13px",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                No calculator matches &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>
        )}
      </form>

      {/* Popular Chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "12px",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
          Popular:
        </span>
        {[
          { label: "Mortgage", url: "/mortgage-calculator" },
          { label: "401(k)", url: "/401k-calculator" },
          { label: "BMI", url: "/bmi-calculator" },
          { label: "Loan", url: "/loan-calculator" },
          { label: "Age", url: "/age-calculator" },
          { label: "Percentage", url: "/percent-calculator" },
        ].map((chip) => (
          <Link
            key={chip.url}
            href={chip.url}
            style={{
              fontSize: "12px",
              color: "#334155",
              background: "#f1f5f9",
              padding: "3px 9px",
              borderRadius: "14px",
              textDecoration: "none",
              border: "1px solid #e2e8f0",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

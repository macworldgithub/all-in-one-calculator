"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import searchIndex from "@/data/search-index.json";
import { SearchIcon, CloseIcon } from "./Icons";

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
        maxWidth: "480px",
        margin: alignCenter ? "0 auto" : "0",
      }}
    >
      <form
        name="calcSearchForm"
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) {
            window.location.href = results[0].url;
          }
        }}
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-card)",
            border: isFocused ? "1.5px solid var(--color-primary)" : "1.5px solid var(--border-subtle)",
            borderRadius: "12px",
            boxShadow: isFocused
              ? "0 0 0 4px var(--color-primary-light)"
              : "var(--shadow-xs)",
            padding: "4px 6px 4px 14px",
            transition: "all 0.15s ease",
          }}
        >
          <SearchIcon size={18} color="var(--text-muted)" className="flex-shrink-0" />

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
              padding: "8px 8px",
              color: "var(--text-primary)",
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
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                marginRight: "4px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Clear search"
            >
              <CloseIcon size={15} />
            </button>
          )}

          <button
            type="submit"
            id="bluebtn"
            style={{
              background: "var(--color-primary)",
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

        {/* Autocomplete Results Dropdown */}
        {isOpen && (
          <div
            id="calcSearchOut"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              zIndex: 100,
              boxShadow: "var(--shadow-lg)",
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
                    borderBottom: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    fontSize: "13.5px",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{r.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textTransform: "capitalize",
                      background: "var(--bg-card-subtle)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    {r.category?.replace(/-/g, " ") || "calculator"}
                  </span>
                </Link>
              ))
            ) : (
              <div
                style={{
                  padding: "16px",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                No calculators match &quot;{query}&quot;
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

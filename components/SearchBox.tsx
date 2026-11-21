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
        margin: "0 auto",
      }}
    >
      <form
        name="calcSearchForm"
        onSubmit={(e) => e.preventDefault()}
        autoComplete="off"
      >
        <table align={alignCenter ? "center" : "left"} id="searchbox">
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  name="calcSearchTerm"
                  id="calcSearchTerm"
                  className="inlongest"
                  placeholder="Search calculators..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                />
              </td>
              <td>
                <span id="bluebtn" style={{ cursor: "pointer" }}>
                  Search
                </span>
              </td>
            </tr>
            {isOpen && (
              <tr>
                <td colSpan={2}>
                  <div
                    id="calcSearchOut"
                    style={{
                      position: "absolute",
                      background: "#fff",
                      border: "1px solid #336699",
                      width: "280px",
                      zIndex: 100,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      textAlign: "left",
                    }}
                  >
                    {results.length > 0 ? (
                      results.map((r) => (
                        <div
                          key={r.url}
                          style={{
                            padding: "6px 8px",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <Link
                            href={r.url}
                            onClick={() => setIsFocused(false)}
                            style={{
                              color: "#006699",
                              textDecoration: "underline",
                              fontSize: "14px",
                              display: "block",
                            }}
                          >
                            {r.name}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "8px",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        No calculator matches &quot;{query}&quot;.
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </form>
    </div>
  );
}

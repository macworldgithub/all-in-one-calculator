"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import searchIndex from "@/data/search-index.json";
import {
  SearchIcon,
  CloseIcon,
  FinancialIcon,
  FitnessIcon,
  MathIcon,
  EverydayIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "./Icons";

interface SearchItem {
  name: string;
  url: string;
  category?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const closePalette = () => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  };

  // Listen to keyboard shortcuts (Ctrl+K, Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closePalette();
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Lock scroll and focus input when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Filter items
  const q = query.trim().toLowerCase();
  const allItems = searchIndex as SearchItem[];

  const filtered = allItems.filter((item) => {
    const matchesQuery = !q || item.name.toLowerCase().includes(q);
    const matchesCat =
      activeCategory === "all" ||
      (activeCategory === "financial" &&
        (!item.category || item.category === "financial" || item.category === "financial-calculator")) ||
      (activeCategory === "fitness" &&
        (item.category === "fitness-and-health" || item.category === "fitness")) ||
      (activeCategory === "math" && item.category === "math") ||
      (activeCategory === "other" && item.category === "other");
    return matchesQuery && matchesCat;
  }).slice(0, 24);

  // Keyboard navigation within list
  const handleKeyInModal = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigateTo(filtered[selectedIndex].url);
    }
  };

  const navigateTo = (url: string) => {
    closePalette();
    router.push(url);
  };

  const getCategoryIcon = (cat?: string) => {
    if (cat === "fitness-and-health" || cat === "fitness") {
      return <FitnessIcon size={16} color="#059669" />;
    }
    if (cat === "math") {
      return <MathIcon size={16} color="#7c3aed" />;
    }
    if (cat === "other") {
      return <EverydayIcon size={16} color="#d97706" />;
    }
    return <FinancialIcon size={16} color="#2563eb" />;
  };

  if (!isOpen) return null;

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={closePalette}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Calculator Search"
    >
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyInModal}
      >
        {/* Search Input Bar */}
        <div className="cmd-input-bar">
          <SearchIcon size={20} color="var(--text-muted)" className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input-field"
            placeholder="Search 200+ calculators (e.g. Mortgage, BMI, Grade)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button
              type="button"
              className="cmd-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear query"
            >
              <CloseIcon size={16} />
            </button>
          )}
          <kbd className="cmd-esc-badge" onClick={closePalette}>
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="cmd-cat-pills">
          {[
            { id: "all", label: "All Tools" },
            { id: "financial", label: "Finance" },
            { id: "fitness", label: "Fitness & Health" },
            { id: "math", label: "Math" },
            { id: "other", label: "Everyday" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cmd-cat-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="cmd-results-list" ref={listRef}>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                key={item.url}
                className={`cmd-result-item ${selectedIndex === index ? "selected" : ""}`}
                onClick={() => navigateTo(item.url)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="cmd-item-icon">{getCategoryIcon(item.category)}</div>
                <div className="cmd-item-info">
                  <span className="cmd-item-title">{item.name}</span>
                  <span className="cmd-item-cat">
                    {item.category?.replace(/-/g, " ") || "calculator"}
                  </span>
                </div>
                <ChevronRightIcon size={16} color="var(--text-muted)" className="cmd-arrow-icon" />
              </div>
            ))
          ) : (
            <div className="cmd-empty-state">
              <SparklesIcon size={24} color="var(--text-muted)" />
              <p className="cmd-empty-title">No calculators found</p>
              <p className="cmd-empty-sub">
                Try searching for keywords like &quot;interest&quot;, &quot;calorie&quot;, &quot;loan&quot;, or &quot;percent&quot;.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="cmd-footer-bar">
          <div className="cmd-footer-hints">
            <span>
              <kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate
            </span>
            <span>
              <kbd>&crarr;</kbd> to select
            </span>
            <span>
              <kbd>ESC</kbd> to close
            </span>
          </div>
          <span className="cmd-footer-count">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}

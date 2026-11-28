"use client";

import React, { useState, useEffect, useRef, useId } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cmdInputId = useId();
  const cmdListId = useId();
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

  // Keyboard navigation + Tab focus trap within modal
  const handleKeyInModal = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigateTo(filtered[selectedIndex].url);
    } else if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
        ref={modalRef}
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyInModal}
      >
        {/* Search Input Bar */}
        <div className="cmd-input-bar">
          <SearchIcon size={20} color="var(--text-muted)" className="cmd-search-icon" />
          <label htmlFor={cmdInputId} className="sr-only">
            Quick calculator search
          </label>
          <input
            id={cmdInputId}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={cmdListId}
            aria-activedescendant={filtered[selectedIndex] ? `${cmdListId}-${selectedIndex}` : undefined}
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
          <button
            type="button"
            className="cmd-esc-badge"
            onClick={closePalette}
            aria-label="Close quick calculator search"
          >
            ESC
          </button>
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
        <div id={cmdListId} className="cmd-results-list" ref={listRef} role="listbox" aria-label="Calculator results">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                id={`${cmdListId}-${index}`}
                key={item.url}
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={-1}
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

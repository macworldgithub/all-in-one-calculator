"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HistoryIcon,
  StarIcon,
  CloseIcon,
  TrashIcon,
  ChevronRightIcon,
} from "./Icons";

export interface CalculationHistoryItem {
  id: string;
  slug: string;
  title: string;
  url: string;
  resultSummary: string;
  inputsSummary?: string;
  timestamp: number;
}

export interface FavoriteItem {
  slug: string;
  title: string;
  url: string;
  category?: string;
}

function getInitialHistory(): CalculationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("allinone_calc_history") || "[]");
  } catch {
    return [];
  }
}

function getInitialFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("allinone_calc_favorites") || "[]");
  } catch {
    return [];
  }
}

function formatTime(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function HistoryFavoritesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");
  const [history, setHistory] = useState<CalculationHistoryItem[]>(getInitialHistory);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(getInitialFavorites);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ tab?: "history" | "favorites" }>) => {
      setHistory(getInitialHistory());
      setFavorites(getInitialFavorites());
      if (e.detail && e.detail.tab) {
        setActiveTab(e.detail.tab);
      }
      setIsOpen(true);
    };

    const handleUpdate = () => {
      setHistory(getInitialHistory());
      setFavorites(getInitialFavorites());
    };

    window.addEventListener("open-calc-drawer" as unknown as keyof WindowEventMap, handleOpen as EventListener);
    window.addEventListener("calc-history-updated" as unknown as keyof WindowEventMap, handleUpdate);
    window.addEventListener("calc-favorites-updated" as unknown as keyof WindowEventMap, handleUpdate);

    return () => {
      window.removeEventListener("open-calc-drawer" as unknown as keyof WindowEventMap, handleOpen as EventListener);
      window.removeEventListener("calc-history-updated" as unknown as keyof WindowEventMap, handleUpdate);
      window.removeEventListener("calc-favorites-updated" as unknown as keyof WindowEventMap, handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const clearHistory = () => {
    localStorage.removeItem("allinone_calc_history");
    setHistory([]);
    window.dispatchEvent(new CustomEvent("calc-history-updated"));
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    localStorage.setItem("allinone_calc_history", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("calc-history-updated"));
  };

  const removeFavorite = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = favorites.filter((f) => f.slug !== slug);
    setFavorites(next);
    localStorage.setItem("allinone_calc_favorites", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("calc-favorites-updated"));
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={() => setIsOpen(false)}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Activity & Favorites Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-tab-switch">
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <HistoryIcon size={16} />
              <span>Recent History</span>
              {history.length > 0 && <span className="drawer-badge">{history.length}</span>}
            </button>
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              <StarIcon size={16} filled={activeTab === "favorites"} />
              <span>Favorites</span>
              {favorites.length > 0 && <span className="drawer-badge">{favorites.length}</span>}
            </button>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close drawer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="drawer-body">
          {activeTab === "history" && (
            <>
              {history.length > 0 ? (
                <div className="drawer-items-list">
                  {history.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="drawer-history-card"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="dh-card-top">
                        <span className="dh-calc-title">{item.title}</span>
                        <div className="dh-actions">
                          <span className="dh-time">{formatTime(item.timestamp)}</span>
                          <button
                            type="button"
                            className="dh-remove-btn"
                            title="Remove"
                            onClick={(e) => removeHistoryItem(item.id, e)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>

                      {item.inputsSummary && (
                        <div className="dh-inputs">{item.inputsSummary}</div>
                      )}

                      <div className="dh-result-pill">
                        <span className="dh-result-text">{item.resultSummary}</span>
                        <ChevronRightIcon size={14} color="var(--text-muted)" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="drawer-empty-state">
                  <div className="drawer-empty-icon">
                    <HistoryIcon size={32} color="var(--text-muted)" />
                  </div>
                  <h3 className="drawer-empty-title">No calculations yet</h3>
                  <p className="drawer-empty-sub">
                    Perform calculations on any tool to see your recent breakdown and results saved here.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "favorites" && (
            <>
              {favorites.length > 0 ? (
                <div className="drawer-items-list">
                  {favorites.map((fav) => (
                    <Link
                      key={fav.slug}
                      href={fav.url}
                      className="drawer-favorite-card"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="df-card-left">
                        <StarIcon size={18} color="#eab308" filled />
                        <div className="df-info">
                          <span className="df-title">{fav.title}</span>
                          <span className="df-cat">
                            {fav.category?.replace(/-/g, " ") || "Calculator"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="df-remove-btn"
                        title="Remove from favorites"
                        onClick={(e) => removeFavorite(fav.slug, e)}
                      >
                        <CloseIcon size={14} />
                      </button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="drawer-empty-state">
                  <div className="drawer-empty-icon">
                    <StarIcon size={32} color="var(--text-muted)" />
                  </div>
                  <h3 className="drawer-empty-title">No favorites yet</h3>
                  <p className="drawer-empty-sub">
                    Star any calculator from the page or search to pin your most-used tools here for instant 1-click access.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {activeTab === "history" && history.length > 0 && (
          <div className="drawer-footer">
            <button
              type="button"
              className="drawer-clear-btn"
              onClick={clearHistory}
            >
              <TrashIcon size={15} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

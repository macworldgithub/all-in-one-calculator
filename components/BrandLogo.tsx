"use client";

import React from "react";

interface BrandLogoProps {
  height?: number;
  className?: string;
}

export default function BrandLogo({ height = 34, className = "" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 40"
      fill="none"
      style={{ height: `${height}px`, width: "auto" }}
      className={`brand-logo-svg ${className}`}
      aria-label="All-in-one-calculator"
    >
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Icon Badge */}
      <rect x="2" y="4" width="32" height="32" rx="8" fill="url(#brandGrad)" />
      {/* Display screen on icon */}
      <rect x="7" y="9" width="22" height="6" rx="2" fill="#ffffff" opacity="0.95" />
      {/* Calculator Key dots */}
      <circle cx="11" cy="21" r="1.75" fill="#ffffff" />
      <circle cx="18" cy="21" r="1.75" fill="#ffffff" />
      <circle cx="25" cy="21" r="1.75" fill="#ffffff" />
      <circle cx="11" cy="28" r="1.75" fill="#ffffff" />
      <circle cx="18" cy="28" r="1.75" fill="#ffffff" />
      <rect x="23" y="26" width="4.5" height="4.5" rx="1.2" fill="#93c5fd" />
      {/* Typography: All-in-one-calculator */}
      <text
        x="44"
        y="26"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif"
        fontSize="19"
        fontWeight="800"
        className="brand-logo-text"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        All-in-one<tspan fill="#3b82f6" fontWeight="700">-calculator</tspan>
      </text>
    </svg>
  );
}

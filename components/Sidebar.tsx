import React from "react";
import Link from "next/link";
import SearchBox from "./SearchBox";

interface SidebarProps {
  category?: string;
  categoryTitle?: string;
}

export default function Sidebar({
  category = "financial",
  categoryTitle = "Financial Calculators",
}: SidebarProps) {
  const getCatLinks = () => {
    if (category === "fitness-and-health") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link href="/bmi-calculator" className="sidebar-link">BMI Calculator</Link>
          <Link href="/calorie-calculator" className="sidebar-link">Calorie Calculator</Link>
          <Link href="/body-fat-calculator" className="sidebar-link">Body Fat Calculator</Link>
          <Link href="/bmr-calculator" className="sidebar-link">BMR Calculator</Link>
          <Link href="/ideal-weight-calculator" className="sidebar-link">Ideal Weight Calculator</Link>
          <Link href="/pace-calculator" className="sidebar-link">Pace Calculator</Link>
          <Link href="/pregnancy-calculator" className="sidebar-link">Pregnancy Calculator</Link>
          <Link href="/due-date-calculator" className="sidebar-link">Due Date Calculator</Link>
          <Link href="/tdee-calculator" className="sidebar-link">TDEE Calculator</Link>
          <Link href="/fitness-and-health-calculator" style={{ color: "#2563eb", fontWeight: 600, padding: "8px 10px", marginTop: "4px" }}>
            More Health Tools &rarr;
          </Link>
        </div>
      );
    }
    if (category === "math") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link href="/scientific-calculator" className="sidebar-link">Scientific Calculator</Link>
          <Link href="/fraction-calculator" className="sidebar-link">Fraction Calculator</Link>
          <Link href="/percent-calculator" className="sidebar-link">Percentage Calculator</Link>
          <Link href="/random-number-generator" className="sidebar-link">Random Number Generator</Link>
          <Link href="/triangle-calculator" className="sidebar-link">Triangle Calculator</Link>
          <Link href="/standard-deviation-calculator" className="sidebar-link">Standard Deviation</Link>
          <Link href="/matrix-calculator" className="sidebar-link">Matrix Calculator</Link>
          <Link href="/math-calculator" style={{ color: "#2563eb", fontWeight: 600, padding: "8px 10px", marginTop: "4px" }}>
            More Math Tools &rarr;
          </Link>
        </div>
      );
    }
    if (category === "other") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link href="/age-calculator" className="sidebar-link">Age Calculator</Link>
          <Link href="/date-calculator" className="sidebar-link">Date Calculator</Link>
          <Link href="/time-calculator" className="sidebar-link">Time Calculator</Link>
          <Link href="/hours-calculator" className="sidebar-link">Hours Calculator</Link>
          <Link href="/gpa-calculator" className="sidebar-link">GPA Calculator</Link>
          <Link href="/grade-calculator" className="sidebar-link">Grade Calculator</Link>
          <Link href="/concrete-calculator" className="sidebar-link">Concrete Calculator</Link>
          <Link href="/ip-subnet-calculator" className="sidebar-link">Subnet Calculator</Link>
          <Link href="/password-generator" className="sidebar-link">Password Generator</Link>
          <Link href="/conversion-calculator" className="sidebar-link">Conversion Calculator</Link>
          <Link href="/tip-calculator" className="sidebar-link">Tip Calculator</Link>
          <Link href="/other-calculator" style={{ color: "#2563eb", fontWeight: 600, padding: "8px 10px", marginTop: "4px" }}>
            More Everyday Tools &rarr;
          </Link>
        </div>
      );
    }
    // Default: financial
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Link href="/mortgage-calculator" className="sidebar-link">Mortgage Calculator</Link>
        <Link href="/loan-calculator" className="sidebar-link">Loan Calculator</Link>
        <Link href="/auto-loan-calculator" className="sidebar-link">Auto Loan Calculator</Link>
        <Link href="/interest-calculator" className="sidebar-link">Interest Calculator</Link>
        <Link href="/payment-calculator" className="sidebar-link">Payment Calculator</Link>
        <Link href="/retirement-calculator" className="sidebar-link">Retirement Calculator</Link>
        <Link href="/amortization-calculator" className="sidebar-link">Amortization Calculator</Link>
        <Link href="/investment-calculator" className="sidebar-link">Investment Calculator</Link>
        <Link href="/currency-calculator" className="sidebar-link">Currency Calculator</Link>
        <Link href="/inflation-calculator" className="sidebar-link">Inflation Calculator</Link>
        <Link href="/finance-calculator" className="sidebar-link">Finance Calculator</Link>
        <Link href="/mortgage-payoff-calculator" className="sidebar-link">Mortgage Payoff</Link>
        <Link href="/tax-calculator" className="sidebar-link">Income Tax Calculator</Link>
        <Link href="/compound-interest-calculator" className="sidebar-link">Compound Interest</Link>
        <Link href="/salary-calculator" className="sidebar-link">Salary Calculator</Link>
        <Link href="/401k-calculator" className="sidebar-link">401(k) Calculator</Link>
        <Link href="/financial-calculator" style={{ color: "#2563eb", fontWeight: 600, padding: "8px 10px", marginTop: "4px" }}>
          More Financial Tools &rarr;
        </Link>
      </div>
    );
  };

  const getCatUrl = () => {
    if (category === "fitness-and-health") return "/fitness-and-health-calculator";
    if (category === "math") return "/math-calculator";
    if (category === "other") return "/other-calculator";
    return "/financial-calculator";
  };

  return (
    <div id="right">
      <div style={{ marginBottom: "20px" }}>
        <SearchBox />
      </div>
      <div
        className="sidebar-card"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#0f172a",
            paddingBottom: "10px",
            marginBottom: "12px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href={getCatUrl()} style={{ color: "#0f172a", textDecoration: "none" }}>
            {categoryTitle}
          </Link>
          <span style={{ fontSize: "11px", color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px" }}>
            Explore
          </span>
        </div>
        <div id="occontent">{getCatLinks()}</div>

        <div
          style={{
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          <Link href="/financial-calculator" style={{ color: "#64748b", textDecoration: "none" }}>Financial</Link>
          <span style={{ color: "#cbd5e1" }}>&bull;</span>
          <Link href="/fitness-and-health-calculator" style={{ color: "#64748b", textDecoration: "none" }}>Fitness &amp; Health</Link>
          <span style={{ color: "#cbd5e1" }}>&bull;</span>
          <Link href="/math-calculator" style={{ color: "#64748b", textDecoration: "none" }}>Math</Link>
          <span style={{ color: "#cbd5e1" }}>&bull;</span>
          <Link href="/other-calculator" style={{ color: "#64748b", textDecoration: "none" }}>Other</Link>
        </div>
      </div>
    </div>
  );
}

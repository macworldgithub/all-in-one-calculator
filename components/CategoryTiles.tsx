import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CategoryTiles() {
  return (
    <div id="homelistdiv" style={{ padding: "30px 0 10px" }}>
      <div id="contentout">
        <div id="homelistwrap">
          {/* Financial Calculators */}
          <div className="homelisttile modern-cat-card">
            <div className="cat-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
                <Image
                  src="/img/financial-calculator.jpg"
                  width={48}
                  height={48}
                  alt="Financial Calculators"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
                  <Link href="/financial-calculator" style={{ color: "#0f172a" }}>Financial</Link>
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Loans, Taxes & Investments</span>
              </div>
            </div>
            <ul className="hl" id="hl1">
              <li><Link href="/mortgage-calculator">Mortgage Calculator</Link></li>
              <li><Link href="/loan-calculator">Loan Calculator</Link></li>
              <li><Link href="/auto-loan-calculator">Auto Loan Calculator</Link></li>
              <li><Link href="/interest-calculator">Interest Calculator</Link></li>
              <li><Link href="/payment-calculator">Payment Calculator</Link></li>
              <li><Link href="/retirement-calculator">Retirement Calculator</Link></li>
              <li><Link href="/amortization-calculator">Amortization Calculator</Link></li>
              <li><Link href="/investment-calculator">Investment Calculator</Link></li>
              <li><Link href="/inflation-calculator">Inflation Calculator</Link></li>
              <li><Link href="/finance-calculator">Finance Calculator</Link></li>
              <li><Link href="/tax-calculator">Income Tax Calculator</Link></li>
              <li><Link href="/compound-interest-calculator">Compound Interest Calculator</Link></li>
              <li><Link href="/salary-calculator">Salary Calculator</Link></li>
              <li><Link href="/interest-rate-calculator">Interest Rate Calculator</Link></li>
              <li><Link href="/sales-tax-calculator">Sales Tax Calculator</Link></li>
            </ul>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <Link href="/financial-calculator" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                All Financial Calculators &rarr;
              </Link>
            </div>
          </div>

          {/* Fitness & Health Calculators */}
          <div className="homelisttile modern-cat-card">
            <div className="cat-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
                <Image
                  src="/img/fitness-calculator.jpg"
                  width={48}
                  height={48}
                  alt="Fitness & Health Calculators"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
                  <Link href="/fitness-and-health-calculator" style={{ color: "#0f172a" }}>Fitness &amp; Health</Link>
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>BMI, Calorie & Body Fat</span>
              </div>
            </div>
            <ul className="hl" id="hl2">
              <li><Link href="/bmi-calculator">BMI Calculator</Link></li>
              <li><Link href="/calorie-calculator">Calorie Calculator</Link></li>
              <li><Link href="/body-fat-calculator">Body Fat Calculator</Link></li>
              <li><Link href="/bmr-calculator">BMR Calculator</Link></li>
              <li><Link href="/ideal-weight-calculator">Ideal Weight Calculator</Link></li>
              <li><Link href="/pace-calculator">Pace Calculator</Link></li>
              <li><Link href="/pregnancy-calculator">Pregnancy Calculator</Link></li>
              <li><Link href="/pregnancy-conception-calculator">Pregnancy Conception Calculator</Link></li>
              <li><Link href="/due-date-calculator">Due Date Calculator</Link></li>
            </ul>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <Link href="/fitness-and-health-calculator" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                All Health Calculators &rarr;
              </Link>
            </div>
          </div>

          {/* Math Calculators */}
          <div className="homelisttile modern-cat-card">
            <div className="cat-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
                <Image
                  src="/img/math-calculator.jpg"
                  width={48}
                  height={48}
                  alt="Math Calculators"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
                  <Link href="/math-calculator" style={{ color: "#0f172a" }}>Math</Link>
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Scientific, Fractions & Percent</span>
              </div>
            </div>
            <ul className="hl" id="hl3">
              <li><Link href="/scientific-calculator">Scientific Calculator</Link></li>
              <li><Link href="/fraction-calculator">Fraction Calculator</Link></li>
              <li><Link href="/percent-calculator">Percentage Calculator</Link></li>
              <li><Link href="/random-number-generator">Random Number Generator</Link></li>
              <li><Link href="/triangle-calculator">Triangle Calculator</Link></li>
              <li><Link href="/standard-deviation-calculator">Standard Deviation Calculator</Link></li>
            </ul>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <Link href="/math-calculator" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                All Math Calculators &rarr;
              </Link>
            </div>
          </div>

          {/* Other Calculators */}
          <div className="homelisttile modern-cat-card">
            <div className="cat-header" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}>
                <Image
                  src="/img/other-calculator.jpg"
                  width={48}
                  height={48}
                  alt="Other Calculators"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
                  <Link href="/other-calculator" style={{ color: "#0f172a" }}>Other</Link>
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Age, Time, GPA & Concrete</span>
              </div>
            </div>
            <ul className="hl" id="hl5">
              <li><Link href="/age-calculator">Age Calculator</Link></li>
              <li><Link href="/date-calculator">Date Calculator</Link></li>
              <li><Link href="/time-calculator">Time Calculator</Link></li>
              <li><Link href="/hours-calculator">Hours Calculator</Link></li>
              <li><Link href="/gpa-calculator">GPA Calculator</Link></li>
              <li><Link href="/grade-calculator">Grade Calculator</Link></li>
              <li><Link href="/concrete-calculator">Concrete Calculator</Link></li>
              <li><Link href="/ip-subnet-calculator">Subnet Calculator</Link></li>
              <li><Link href="/password-generator">Password Generator</Link></li>
              <li><Link href="/conversion-calculator">Conversion Calculator</Link></li>
            </ul>
            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <Link href="/other-calculator" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                All Other Calculators &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: "32px", paddingBottom: "16px" }}>
          <Link
            href="/sitemap"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <span>Browse All 200+ Calculators</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

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
        <>
          <Link href="/bmi-calculator">BMI</Link>
          <Link href="/calorie-calculator">Calorie</Link>
          <Link href="/body-fat-calculator">Body Fat</Link>
          <Link href="/bmr-calculator">BMR</Link>
          <Link href="/ideal-weight-calculator">Ideal Weight</Link>
          <Link href="/pace-calculator">Pace</Link>
          <Link href="/pregnancy-calculator">Pregnancy</Link>
          <Link href="/due-date-calculator">Due Date</Link>
          <Link href="/tdee-calculator">TDEE</Link>
          <Link href="/fitness-and-health-calculator">More Fitness Calculators</Link>
        </>
      );
    }
    if (category === "math") {
      return (
        <>
          <Link href="/scientific-calculator">Scientific</Link>
          <Link href="/fraction-calculator">Fraction</Link>
          <Link href="/percent-calculator">Percentage</Link>
          <Link href="/random-number-generator">Random Number</Link>
          <Link href="/triangle-calculator">Triangle</Link>
          <Link href="/standard-deviation-calculator">Standard Deviation</Link>
          <Link href="/matrix-calculator">Matrix</Link>
          <Link href="/math-calculator">More Math Calculators</Link>
        </>
      );
    }
    if (category === "other") {
      return (
        <>
          <Link href="/age-calculator">Age</Link>
          <Link href="/date-calculator">Date</Link>
          <Link href="/time-calculator">Time</Link>
          <Link href="/hours-calculator">Hours</Link>
          <Link href="/gpa-calculator">GPA</Link>
          <Link href="/grade-calculator">Grade</Link>
          <Link href="/concrete-calculator">Concrete</Link>
          <Link href="/ip-subnet-calculator">Subnet</Link>
          <Link href="/password-generator">Password</Link>
          <Link href="/conversion-calculator">Conversion</Link>
          <Link href="/tip-calculator">Tip</Link>
          <Link href="/other-calculator">More Other Calculators</Link>
        </>
      );
    }
    // Default: financial
    return (
      <>
        <Link href="/mortgage-calculator">Mortgage</Link>
        <Link href="/loan-calculator">Loan</Link>
        <Link href="/auto-loan-calculator">Auto Loan</Link>
        <Link href="/interest-calculator">Interest</Link>
        <Link href="/payment-calculator">Payment</Link>
        <Link href="/retirement-calculator">Retirement</Link>
        <Link href="/amortization-calculator">Amortization</Link>
        <Link href="/investment-calculator">Investment</Link>
        <Link href="/currency-calculator">Currency</Link>
        <Link href="/inflation-calculator">Inflation</Link>
        <Link href="/finance-calculator">Finance</Link>
        <Link href="/mortgage-payoff-calculator">Mortgage Payoff</Link>
        <Link href="/tax-calculator">Income Tax</Link>
        <Link href="/compound-interest-calculator">Compound Interest</Link>
        <Link href="/salary-calculator">Salary</Link>
        <Link href="/401k-calculator">401K</Link>
        <Link href="/interest-rate-calculator">Interest Rate</Link>
        <Link href="/sales-tax-calculator">Sales Tax</Link>
        <Link href="/payback-period-calculator">Payback Period</Link>
        <Link href="/financial-calculator">More Financial Calculators</Link>
      </>
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
      <div style={{ paddingTop: "10px", minHeight: "60px", textAlign: "center" }}>
        <SearchBox />
      </div>
      <div id="othercalc">
        <div id="octitle">
          <Link href={getCatUrl()}>{categoryTitle}</Link>
        </div>
        <div id="occontent">{getCatLinks()}</div>
        <div id="ocother">
          <Link href="/financial-calculator">Financial</Link> |{" "}
          <Link href="/fitness-and-health-calculator">Fitness and Health</Link> |{" "}
          <Link href="/math-calculator">Math</Link> |{" "}
          <Link href="/other-calculator">Other</Link>
        </div>
      </div>
    </div>
  );
}

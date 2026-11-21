import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Financial Calculators - All In One Calculator",
  description: "A compilation of free financial calculators involving mortgages, loans, investments, debt, retirement, and more.",
};

const contentHtml = `<p>The following is a complete list of our financial calculators.</p>
<table class="smtb" width="90%"><tr><td class="sectionlists" valign="top"><h3 class="h3head">Mortgage and Real Estate</h3><div><a href="/mortgage-calculator">Mortgage Calculator</a></div><div><a href="/amortization-calculator">Amortization Calculator</a></div><div><a href="/mortgage-payoff-calculator">Mortgage Payoff Calculator</a></div><div><a href="/house-affordability-calculator">House Affordability Calculator</a></div><div><a href="/rent-calculator">Rent Calculator</a></div><div><a href="/debt-ratio-calculator">Debt-to-Income Ratio Calculator</a></div><div><a href="/real-estate-calculator">Real Estate Calculator</a></div><div><a href="/refinance-calculator">Refinance Calculator</a></div><div><a href="/rental-property-calculator">Rental Property Calculator</a></div><div><a href="/apr-calculator">APR Calculator</a></div><div><a href="/fha-loan-calculator">FHA Loan Calculator</a></div><div><a href="/va-mortgage-calculator">VA Mortgage Calculator</a></div><div><a href="/home-equity-loan-calculator">Home Equity Loan Calculator</a></div><div><a href="/heloc-calculator">HELOC Calculator</a></div><div><a href="/down-payment-calculator">Down Payment Calculator</a></div><div><a href="/rent-vs-buy-calculator">Rent vs. Buy Calculator</a></div><h3 class="h3head">Auto</h3><div><a href="/auto-loan-calculator">Auto Loan Calculator</a></div><div><a href="/cash-back-or-low-interest-calculator">Cash Back or Low Interest Calculator</a></div><div><a href="/auto-lease-calculator">Auto Lease Calculator</a></div><h3 class="h3head">Investment</h3><div><a href="/interest-calculator">Interest Calculator</a></div><div><a href="/investment-calculator">Investment Calculator</a></div><div><a href="/finance-calculator">Finance Calculator</a></div><div><a href="/compound-interest-calculator">Compound Interest Calculator</a></div><div><a href="/interest-rate-calculator">Interest Rate Calculator</a></div><div><a href="/savings-calculator">Savings Calculator</a></div><div><a href="/simple-interest-calculator">Simple Interest Calculator</a></div><div><a href="/cd-calculator">CD Calculator</a></div><div><a href="/bond-calculator">Bond Calculator</a></div><div><a href="/mutual-fund-calculator">Mutual Fund Calculator</a></div><div><a href="/average-return-calculator">Average Return Calculator</a></div><div><a href="/irr-calculator">IRR Calculator</a></div><div><a href="/roi-calculator">ROI Calculator</a></div><div><a href="/payback-period-calculator">Payback Period Calculator</a></div><div><a href="/present-value-calculator">Present Value Calculator</a></div><div><a href="/future-value-calculator">Future Value Calculator</a></div></td><td class="sectionlists" valign="top"><h3 class="h3head">Retirement</h3><div><a href="/retirement-calculator">Retirement Calculator</a></div><div><a href="/401k-calculator">401K Calculator</a></div><div><a href="/pension-calculator">Pension Calculator</a></div><div><a href="/social-security-calculator">Social Security Calculator</a></div><div><a href="/annuity-calculator">Annuity Calculator</a></div><div><a href="/annuity-payout-calculator">Annuity Payout Calculator</a></div><div><a href="/roth-ira-calculator">Roth IRA Calculator</a></div><div><a href="/ira-calculator">IRA Calculator</a></div><div><a href="/rmd-calculator">RMD Calculator</a></div><h3 class="h3head">Tax and Salary</h3><div><a href="/tax-calculator">Income Tax Calculator</a></div><div><a href="/salary-calculator">Salary Calculator</a></div><div><a href="/marriage-calculator">Marriage Tax Calculator</a></div><div><a href="/estate-tax-calculator">Estate Tax Calculator</a></div><div><a href="/take-home-pay-calculator">Take-Home-Paycheck Calculator</a></div><h3 class="h3head">Other</h3><div><a href="/loan-calculator">Loan Calculator</a></div><div><a href="/payment-calculator">Payment Calculator</a></div><div><a href="/currency-calculator">Currency Calculator</a></div><div><a href="/inflation-calculator">Inflation Calculator</a></div><div><a href="/sales-tax-calculator">Sales Tax Calculator</a></div><div><a href="/credit-card-calculator">Credit Card Calculator</a></div><div><a href="/credit-card-payoff-calculator">Credit Cards Payoff Calculator</a></div><div><a href="/debt-payoff-calculator">Debt Payoff Calculator</a></div><div><a href="/debt-consolidation-calculator">Debt Consolidation Calculator</a></div><div><a href="/repayment-calculator">Repayment Calculator</a></div><div><a href="/student-loan-calculator">Student Loan Calculator</a></div><div><a href="/college-cost-calculator">College Cost Calculator</a></div><div><a href="/vat-calculator">VAT Calculator</a></div><div><a href="/depreciation-calculator">Depreciation Calculator</a></div><div><a href="/margin-calculator">Margin Calculator</a></div><div><a href="/discount-calculator">Discount Calculator</a></div><div><a href="/business-loan-calculator">Business Loan Calculator</a></div><div><a href="/personal-loan-calculator">Personal Loan Calculator</a></div><div><a href="/boat-loan-calculator">Boat Loan Calculator</a></div><div><a href="/lease-calculator">Lease Calculator</a></div><div><a href="/budget-calculator">Budget Calculator</a></div><div><a href="/commission-calculator">Commission Calculator</a></div></td></tr></table>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>financial</span>
          </div>
          <h1>Financial Calculators</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <Sidebar category="financial" categoryTitle="Financial Calculators" />
      </div>
      <div id="clear"></div>
      <div className="topNavAbs">
        <Link href="/financial-calculator" className="topNavOn">Financial</Link>
        <Link href="/fitness-and-health-calculator" className="">Fitness &amp; Health</Link>
        <Link href="/math-calculator" className="">Math</Link>
        <Link href="/other-calculator" className="">Other</Link>
      </div>
    </>
  );
}

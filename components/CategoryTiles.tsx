import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function CategoryTiles() {
  return (
    <div id="homelistdiv">
      <div id="contentout">
        <div id="homelistwrap">
          {/* Financial Calculators */}
          <div className="homelisttile">
            <div className="hicon">
              <Link href="/financial-calculator">
                <Image
                  src="/img/financial-calculator.jpg"
                  width={135}
                  height={135}
                  alt="Financial Calculators"
                />
              </Link>
            </div>
            <div className="hh">
              <Link href="/financial-calculator">Financial Calculators</Link>
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
          </div>

          {/* Fitness & Health Calculators */}
          <div className="homelisttile">
            <div className="hicon">
              <Link href="/fitness-and-health-calculator">
                <Image
                  src="/img/fitness-calculator.jpg"
                  width={135}
                  height={135}
                  alt="Fitness & Health Calculators"
                />
              </Link>
            </div>
            <div className="hh">
              <Link href="/fitness-and-health-calculator">Fitness &amp; Health Calculators</Link>
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
          </div>

          {/* Math Calculators */}
          <div className="homelisttile">
            <div className="hicon">
              <Link href="/math-calculator">
                <Image
                  src="/img/math-calculator.jpg"
                  width={135}
                  height={135}
                  alt="Math Calculators"
                />
              </Link>
            </div>
            <div className="hh">
              <Link href="/math-calculator">Math Calculators</Link>
            </div>
            <ul className="hl" id="hl3">
              <li><Link href="/scientific-calculator">Scientific Calculator</Link></li>
              <li><Link href="/fraction-calculator">Fraction Calculator</Link></li>
              <li><Link href="/percent-calculator">Percentage Calculator</Link></li>
              <li><Link href="/random-number-generator">Random Number Generator</Link></li>
              <li><Link href="/triangle-calculator">Triangle Calculator</Link></li>
              <li><Link href="/standard-deviation-calculator">Standard Deviation Calculator</Link></li>
            </ul>
          </div>

          {/* Other Calculators */}
          <div className="homelisttile">
            <div className="hicon">
              <Link href="/other-calculator">
                <Image
                  src="/img/other-calculator.jpg"
                  width={135}
                  height={135}
                  alt="Other Calculators"
                />
              </Link>
            </div>
            <div className="hh">
              <Link href="/other-calculator">Other Calculators</Link>
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
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: "30px" }}>
          <Link href="/sitemap">
            <Image
              src="/img/svg/all-calculators.svg"
              width={248}
              height={45}
              alt="All Calculators"
              style={{ display: "inline-block" }}
            />
          </Link>
        </div>
        <br />
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Fitness and Health Calculators - Calculator.net",
  description: "A list of fitness and health related calculators including BMI, calorie, body fat, BMR, pace, pregnancy, and more.",
};

const contentHtml = `<p>The following is a complete list of our fitness and health related calculators.</p>
<table class="smtb" width="90%"><tr><td class="sectionlists" valign="top"><h3 class="h3head">Fitness</h3><div><a href="/bmi-calculator">BMI Calculator</a></div><div><a href="/calorie-calculator">Calorie Calculator</a></div><div><a href="/body-fat-calculator">Body Fat Calculator</a></div><div><a href="/bmr-calculator">BMR Calculator</a></div><div><a href="/ideal-weight-calculator">Ideal Weight Calculator</a></div><div><a href="/pace-calculator">Pace Calculator</a></div><div><a href="/army-body-fat-calculator">Army Body Fat Calculator</a></div><div><a href="/lean-body-mass-calculator">Lean Body Mass Calculator</a></div><div><a href="/healthy-weight-calculator">Healthy Weight Calculator</a></div><div><a href="/calories-burned-calculator">Calories Burned Calculator</a></div><div><a href="/one-rep-max-calculator">One Rep Max Calculator</a></div><div><a href="/target-heart-rate-calculator">Target Heart Rate Calculator</a></div></td><td class="sectionlists" valign="top"><h3 class="h3head">Pregnancy</h3><div><a href="/pregnancy-calculator">Pregnancy Calculator</a></div><div><a href="/pregnancy-weight-gain-calculator">Pregnancy Weight Gain Calculator</a></div><div><a href="/pregnancy-conception-calculator">Pregnancy Conception Calculator</a></div><div><a href="/due-date-calculator">Due Date Calculator</a></div><div><a href="/ovulation-calculator">Ovulation Calculator</a></div><div><a href="/conception-calculator">Conception Calculator</a></div><div><a href="/period-calculator">Period Calculator</a></div><h3 class="h3head">Other</h3><div><a href="/macro-calculator">Macro Calculator</a></div><div><a href="/carbohydrate-calculator">Carbohydrate Calculator</a></div><div><a href="/protein-calculator">Protein Calculator</a></div><div><a href="/fat-intake-calculator">Fat Intake Calculator</a></div><div><a href="/tdee-calculator">TDEE Calculator</a></div><div><a href="/gfr-calculator">GFR Calculator</a></div><div><a href="/body-type-calculator">Body Type Calculator</a></div><div><a href="/body-surface-area-calculator">Body Surface Area Calculator</a></div><div><a href="/bac-calculator">BAC Calculator</a></div></td></tr></table>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>fitness & health</span>
          </div>
          <h1>Fitness and Health Calculators</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <Sidebar category="fitness-and-health" categoryTitle="Fitness and Health Calculators" />
      </div>
      <div id="clear"></div>
      <div className="topNavAbs">
        <Link href="/financial-calculator" className="">Financial</Link>
        <Link href="/fitness-and-health-calculator" className="topNavOn">Fitness &amp; Health</Link>
        <Link href="/math-calculator" className="">Math</Link>
        <Link href="/other-calculator" className="">Other</Link>
      </div>
    </>
  );
}

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Math Calculators - All In One Calculator",
  description: "Free online math calculators for fractions, percentages, standard deviation, matrices, triangles, algebra, and geometry.",
};

const contentHtml = `<table align="right">
<tr><td id="sciout">
<div>
<div id="sciInPut"> </div>
<div id="sciOutPut">0</div>
</div>
<div style="padding-top:3px;">
<div><span class="scinm" onclick="r(7)">7</span><span class="scinm" onclick="r(8)">8</span><span class="scinm" onclick="r(9)">9</span><span class="sciop" onclick="r('+')">+</span><span class="sciop" onclick="r('bk')">Back</span></div>
<div><span class="scinm" onclick="r(4)">4</span><span class="scinm" onclick="r(5)">5</span><span class="scinm" onclick="r(6)">6</span><span class="sciop" onclick="r('-')">–</span><span class="sciop" onclick="r('ans')">Ans</span></div>
<div><span class="scinm" onclick="r(1)">1</span><span class="scinm" onclick="r(2)">2</span><span class="scinm" onclick="r(3)">3</span><span class="sciop" onclick="r('*')">×</span><span class="sciop" onclick="r('M+')">M+</span></div>
<div><span class="scinm" onclick="r(0)">0</span><span class="scinm" onclick="r('.')">.</span><span class="sciop" onclick="r('EXP')">EXP</span><span class="sciop" onclick="r('/')">÷</span><span class="sciop" onclick="r('M-')">M-</span></div>
<div><span class="sciop" onclick="r('+/-')">±</span><span class="sciop" onclick="r('RND')">RND</span><span class="scieq" onclick="r('C')">AC</span><span class="scieq" onclick="r('=')">=</span><span class="sciop" id="scimrc" onclick="r('MR')">MR</span></div>
</div>
<div id="scihistory"></div>
</td></tr></table>
<p>Use the basic math calculator to do simple calculations or use one of the following calculators.</p>
<table class="smtb"><tr><td class="sectionlists" valign="top"><div><a href="/scientific-calculator">Scientific Calculator</a></div><div><a href="/fraction-calculator">Fraction Calculator</a></div><div><a href="/percent-calculator">Percentage Calculator</a></div><div><a href="/random-number-generator">Random Number Generator</a></div><div><a href="/percent-error-calculator">Percent Error Calculator</a></div><div><a href="/exponent-calculator">Exponent Calculator</a></div><div><a href="/binary-calculator">Binary Calculator</a></div><div><a href="/hex-calculator">Hex Calculator</a></div><div><a href="/half-life-calculator">Half-Life Calculator</a></div><div><a href="/quadratic-formula-calculator">Quadratic Formula Calculator</a></div><div><a href="/log-calculator">Log Calculator</a></div><div><a href="/ratio-calculator">Ratio Calculator</a></div><div><a href="/root-calculator">Root Calculator</a></div><div><a href="/lcm-calculator">Least Common Multiple Calculator</a></div><div><a href="/gcf-calculator">Greatest Common Factor Calculator</a></div><div><a href="/factor-calculator">Factor Calculator</a></div><div><a href="/rounding-calculator">Rounding Calculator</a></div><div><a href="/matrix-calculator">Matrix Calculator</a></div><div><a href="/scientific-notation-calculator">Scientific Notation Calculator</a></div><div><a href="/big-number-calculator">Big Number Calculator</a></div></td></tr></table><h3 class="h3head">Statistics</h3><table class="smtb"><tr><td class="sectionlists" valign="top"><div><a href="/standard-deviation-calculator">Standard Deviation Calculator</a></div><div><a href="/number-sequence-calculator">Number Sequence Calculator</a></div><div><a href="/sample-size-calculator">Sample Size Calculator</a></div><div><a href="/probability-calculator">Probability Calculator</a></div><div><a href="/statistics-calculator">Statistics Calculator</a></div><div><a href="/mean-median-mode-range-calculator">Mean, Median, Mode, Range Calculator</a></div><div><a href="/permutation-and-combination-calculator">Permutation and Combination Calculator</a></div><div><a href="/z-score-calculator">Z-score Calculator</a></div><div><a href="/confidence-interval-calculator">Confidence Interval Calculator</a></div></td></tr></table><h3 class="h3head">Geometry</h3><table class="smtb"><tr><td class="sectionlists" valign="top"><div><a href="/triangle-calculator">Triangle Calculator</a></div><div><a href="/volume-calculator">Volume Calculator</a></div><div><a href="/slope-calculator">Slope Calculator</a></div><div><a href="/area-calculator">Area Calculator</a></div><div><a href="/distance-calculator">Distance Calculator</a></div><div><a href="/circle-calculator">Circle Calculator</a></div><div><a href="/surface-area-calculator">Surface Area Calculator</a></div><div><a href="/pythagorean-theorem-calculator">Pythagorean Theorem Calculator</a></div><div><a href="/right-triangle-calculator">Right Triangle Calculator</a></div></td></tr></table>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>math</span>
          </div>
          <h1>Math Calculators</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <Sidebar category="math" categoryTitle="Math Calculators" />
      </div>
      <div id="clear"></div>
      <div className="topNavAbs">
        <Link href="/financial-calculator" className="">Financial</Link>
        <Link href="/fitness-and-health-calculator" className="">Fitness &amp; Health</Link>
        <Link href="/math-calculator" className="topNavOn">Math</Link>
        <Link href="/other-calculator" className="">Other</Link>
      </div>
    </>
  );
}

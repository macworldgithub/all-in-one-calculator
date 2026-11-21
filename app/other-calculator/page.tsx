import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Other Calculators - Calculator.net",
  description: "A collection of useful calculators including age, date, time, GPA, grade, concrete, subnet, conversion, and tip calculators.",
};

const contentHtml = `<table class="smtb" width="90%"><tr><td class="sectionlists" valign="top"><h3 class="h3head">Date and Time</h3><div><a href="/age-calculator">Age Calculator</a></div><div><a href="/date-calculator">Date Calculator</a></div><div><a href="/time-calculator">Time Calculator</a></div><div><a href="/hours-calculator">Hours Calculator</a></div><div><a href="/time-card-calculator">Time Card Calculator</a></div><div><a href="/time-zone-calculator">Time Zone Calculator</a></div><div><a href="/time-duration-calculator">Time Duration Calculator</a></div><div><a href="/day-counter">Day Counter</a></div><div><a href="/day-of-the-week-calculator">Day of the Week Calculator</a></div><h3 class="h3head">Housing/Building</h3><div><a href="/concrete-calculator">Concrete Calculator</a></div><div><a href="/btu-calculator">BTU Calculator</a></div><div><a href="/square-footage-calculator">Square Footage Calculator</a></div><div><a href="/stair-calculator">Stair Calculator</a></div><div><a href="/roofing-calculator">Roofing Calculator</a></div><div><a href="/tile-calculator">Tile Calculator</a></div><div><a href="/mulch-calculator">Mulch Calculator</a></div><div><a href="/gravel-calculator">Gravel Calculator</a></div><h3 class="h3head">Various Measurements/Units</h3><div><a href="/height-calculator">Height Calculator</a></div><div><a href="/conversion-calculator">Conversion Calculator</a></div><div><a href="/gdp-calculator">GDP Calculator</a></div><div><a href="/density-calculator">Density Calculator</a></div><div><a href="/mass-calculator">Mass Calculator</a></div><div><a href="/weight-calculator">Weight Calculator</a></div><div><a href="/speed-calculator">Speed Calculator</a></div><div><a href="/molarity-calculator">Molarity Calculator</a></div><div><a href="/molecular-weight-calculator">Molecular Weight Calculator</a></div><div><a href="/roman-numeral-converter">Roman Numeral Converter</a></div><h3 class="h3head">Electronics/Circuits</h3><div><a href="/voltage-drop-calculator">Voltage Drop Calculator</a></div><div><a href="/resistor-calculator">Resistor Calculator</a></div><div><a href="/ohms-law-calculator">Ohms Law Calculator</a></div><div><a href="/electricity-calculator">Electricity Calculator</a></div></td><td class="sectionlists" valign="top"><h3 class="h3head">Internet</h3><div><a href="/ip-subnet-calculator">IP Subnet Calculator</a></div><div><a href="/password-generator">Password Generator</a></div><div><a href="/bandwidth-calculator">Bandwidth Calculator</a></div><div><a href="/base64-encode-decode">Base64 Encode / Decode</a></div><div><a href="/url-encode-decode">URL Encode / Decode</a></div><h3 class="h3head">Everyday Utility</h3><div><a href="/gpa-calculator">GPA Calculator</a></div><div><a href="/grade-calculator">Grade Calculator</a></div><div><a href="/bra-size-calculator">Bra Size Calculator</a></div><div><a href="/shoe-size-conversion">Shoe Size Conversion</a></div><div><a href="/tip-calculator">Tip Calculator</a></div><div><a href="/golf-handicap-calculator">Golf Handicap Calculator</a></div><div><a href="/sleep-calculator">Sleep Calculator</a></div><h3 class="h3head">Weather</h3><div><a href="/wind-chill-calculator">Wind Chill Calculator</a></div><div><a href="/heat-index-calculator">Heat Index Calculator</a></div><div><a href="/dew-point-calculator">Dew Point Calculator</a></div><h3 class="h3head">Transportation</h3><div><a href="/fuel-cost-calculator">Fuel Cost Calculator</a></div><div><a href="/gas-mileage-calculator">Gas Mileage Calculator</a></div><div><a href="/horsepower-calculator">Horsepower Calculator</a></div><div><a href="/engine-horsepower-calculator">Engine Horsepower Calculator</a></div><div><a href="/mileage-calculator">Mileage Calculator</a></div><div><a href="/tire-size-calculator">Tire Size Calculator</a></div><h3 class="h3head">Entertainment/Anecdotes</h3><div><a href="/dice-roller">Dice Roller</a></div><div><a href="/love-calculator">Love Calculator</a></div></td></tr></table>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>other</span>
          </div>
          <h1>Other Calculators</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <Sidebar category="other" categoryTitle="Other Calculators" />
      </div>
      <div id="clear"></div>
      <div className="topNavAbs">
        <Link href="/financial-calculator" className="">Financial</Link>
        <Link href="/fitness-and-health-calculator" className="">Fitness &amp; Health</Link>
        <Link href="/math-calculator" className="">Math</Link>
        <Link href="/other-calculator" className="topNavOn">Other</Link>
      </div>
    </>
  );
}

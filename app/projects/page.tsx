import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Mobile Apps and Plugins - Calculator.net",
  description: "Calculator related mobile apps, plugins for WordPress, and desktop applications.",
};

const contentHtml = `<div class="smalltext"><a href="/">Home</a> / <a href="/projects/">plugins</a></div>

<h2>Wordpress Plugins</h2>
<p>We have the following wordpress plugins available. All of these are free under the <a href="/https://www.gnu.org/licenses/gpl-3.0">GNU GPL license</a>.</p>
<ul>
<li><a href="/bmi-calculator-widget.php">BMI Calculator</a></li>
<li><a href="/love-calculator-widget.php">Love Calculator</a></li>
<li><a href="/math-calculator-widget.php">Math Calculator</a></li>
<li><a href="/mortgage-calculator-widget.php">Mortgage Loan Calculator</a></li>
</ul>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>plugins</span>
          </div>
          <h1>Mobile Apps and Plugins</h1>
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

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { PlugIcon } from "@/components/Icons";

export const metadata = {
  title: "Mobile Apps and Plugins - All-in-one-calculator",
  description: "Calculator related mobile apps, plugins for WordPress, and desktop applications on All-in-one-calculator.",
};

export default function Page() {
  return (
    <main className="calc-page-wrapper">
      <div className="calc-page-container">
        <article className="calc-main-content">
          <nav className="modern-breadcrumbs">
            <Link href="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Plugins &amp; Apps</span>
          </nav>

          <header className="hub-header">
            <div className="hub-badge">
              <PlugIcon size={14} color="var(--color-primary)" />
              <span>Integrations</span>
            </div>
            <h1 className="hub-title">Mobile Apps &amp; Plugins</h1>
            <p className="hub-subtitle">
              Embed All-in-one-calculator tools directly onto your website or blog.
            </p>
          </header>

          <div className="modern-article-card">
            <h2>Embeddable Calculator Widgets</h2>
            <p>
              Free calculation widgets available under the GNU GPL license:
            </p>
            <ul>
              <li><Link href="/bmi-calculator">BMI Calculator Widget</Link></li>
              <li><Link href="/love-calculator">Love Calculator Widget</Link></li>
              <li><Link href="/math-calculator">Math Calculator Widget</Link></li>
              <li><Link href="/mortgage-calculator">Mortgage Loan Calculator Widget</Link></li>
            </ul>
          </div>
        </article>

        <aside className="calc-sidebar-aside">
          <Sidebar category="other" categoryTitle="Other Calculators" />
        </aside>
      </div>
    </main>
  );
}

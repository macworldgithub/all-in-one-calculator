import React from "react";
import Link from "next/link";

export default function CategoryTiles() {
  const categories = [
    {
      title: "Financial",
      href: "/financial-calculator",
      badge: "76 Tools",
      icon: "💰",
      description: "Mortgages, Loans, Investments & Taxes",
      links: [
        { label: "Mortgage Calculator", href: "/mortgage-calculator" },
        { label: "Loan Calculator", href: "/loan-calculator" },
        { label: "Auto Loan Calculator", href: "/auto-loan-calculator" },
        { label: "Interest Calculator", href: "/interest-calculator" },
        { label: "Payment Calculator", href: "/payment-calculator" },
        { label: "Retirement Calculator", href: "/retirement-calculator" },
        { label: "Amortization Calculator", href: "/amortization-calculator" },
        { label: "Investment Calculator", href: "/investment-calculator" },
        { label: "Inflation Calculator", href: "/inflation-calculator" },
        { label: "Income Tax Calculator", href: "/tax-calculator" },
        { label: "Salary Calculator", href: "/salary-calculator" },
        { label: "401(k) Calculator", href: "/401k-calculator" },
      ],
      moreLabel: "All 76 Financial Tools",
    },
    {
      title: "Fitness & Health",
      href: "/fitness-and-health-calculator",
      badge: "32 Tools",
      icon: "💪",
      description: "BMI, Calories, Body Fat & Pregnancy",
      links: [
        { label: "BMI Calculator", href: "/bmi-calculator" },
        { label: "Calorie Calculator", href: "/calorie-calculator" },
        { label: "Body Fat Calculator", href: "/body-fat-calculator" },
        { label: "BMR Calculator", href: "/bmr-calculator" },
        { label: "Ideal Weight Calculator", href: "/ideal-weight-calculator" },
        { label: "Pace Calculator", href: "/pace-calculator" },
        { label: "Pregnancy Calculator", href: "/pregnancy-calculator" },
        { label: "Due Date Calculator", href: "/due-date-calculator" },
        { label: "TDEE Calculator", href: "/tdee-calculator" },
        { label: "Target Heart Rate", href: "/target-heart-rate-calculator" },
        { label: "Ovulation Calculator", href: "/ovulation-calculator" },
        { label: "Healthy Weight", href: "/healthy-weight-calculator" },
      ],
      moreLabel: "All 32 Health Tools",
    },
    {
      title: "Math & Science",
      href: "/math-calculator",
      badge: "45 Tools",
      icon: "📐",
      description: "Scientific, Percentages & Geometry",
      links: [
        { label: "Scientific Calculator", href: "/scientific-calculator" },
        { label: "Fraction Calculator", href: "/fraction-calculator" },
        { label: "Percentage Calculator", href: "/percent-calculator" },
        { label: "Random Number Generator", href: "/random-number-generator" },
        { label: "Triangle Calculator", href: "/triangle-calculator" },
        { label: "Standard Deviation", href: "/standard-deviation-calculator" },
        { label: "Matrix Calculator", href: "/matrix-calculator" },
        { label: "Volume Calculator", href: "/volume-calculator" },
        { label: "Area Calculator", href: "/area-calculator" },
        { label: "Pythagorean Theorem", href: "/pythagorean-theorem-calculator" },
        { label: "Log Calculator", href: "/log-calculator" },
        { label: "Exponent Calculator", href: "/exponent-calculator" },
      ],
      moreLabel: "All 45 Math Tools",
    },
    {
      title: "Other & Everyday",
      href: "/other-calculator",
      badge: "62 Tools",
      icon: "⚡",
      description: "Age, Dates, GPA, Concrete & Tools",
      links: [
        { label: "Age Calculator", href: "/age-calculator" },
        { label: "Date Calculator", href: "/date-calculator" },
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Hours Calculator", href: "/hours-calculator" },
        { label: "GPA Calculator", href: "/gpa-calculator" },
        { label: "Grade Calculator", href: "/grade-calculator" },
        { label: "Concrete Calculator", href: "/concrete-calculator" },
        { label: "Subnet Calculator", href: "/ip-subnet-calculator" },
        { label: "Password Generator", href: "/password-generator" },
        { label: "Conversion Calculator", href: "/conversion-calculator" },
        { label: "Tip Calculator", href: "/tip-calculator" },
        { label: "Fuel Cost Calculator", href: "/fuel-cost-calculator" },
      ],
      moreLabel: "All 62 Everyday Tools",
    },
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        <div className="section-header">
          <span className="section-pill">Explore Categories</span>
          <h2 className="section-heading">Browse All Calculator Categories</h2>
          <p className="section-subheading">
            Choose from over 200 tailored calculations with clear step-by-step results and explanations.
          </p>
        </div>

        <div className="category-cards-grid">
          {categories.map((cat) => (
            <div key={cat.title} className="category-deck-card">
              <div className="deck-card-top">
                <div className="deck-icon-badge">{cat.icon}</div>
                <div className="deck-title-group">
                  <h3 className="deck-title">
                    <Link href={cat.href}>{cat.title}</Link>
                  </h3>
                  <span className="deck-badge">{cat.badge}</span>
                </div>
              </div>
              <p className="deck-desc">{cat.description}</p>

              <ul className="deck-links-list">
                {cat.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="deck-link-item">
                      <span>{link.label}</span>
                      <span className="deck-link-arrow">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="deck-card-footer">
                <Link href={cat.href} className="deck-more-btn">
                  <span>{cat.moreLabel}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Directory Link */}
        <div className="global-directory-cta">
          <div className="cta-content">
            <h3>Need a specific tool?</h3>
            <p>Search across all 200+ specialized calculators or explore the complete sitemap directory.</p>
          </div>
          <Link href="/sitemap" className="cta-button">
            View All 200+ Calculators &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

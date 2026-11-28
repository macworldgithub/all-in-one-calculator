# Changelog

All notable changes to **All-in-one-calculator** are documented in this file.

## [1.1.0] - 2026-11-28

### Security & Privacy
- Replaced all `eval()` and `Function()` math evaluators in `components/ScientificCalculator.tsx`, `public/js/calc-engines.js`, and `public/js/conversion.js` with CSP-safe recursive-descent parsers.
- Escaped untrusted inputs and query parameters across `calc-engines.js`, `conversion.js`, `quick-conversion.js`, and `common.js`; validated URL query parameter keys and `Form` selectors.
- Added strict production HTTP security headers (`Content-Security-Policy` without `'unsafe-eval'`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) in `next.config.ts`.
- Added strict slug allowlist and path-containment guards in `lib/calculators.ts`.
- Replaced legacy `/my-account/save.php` and `/my-account/save-delete.php` calls in `public/js/common.js` with local `localStorage` persistence and updated Privacy Policy disclosure in `app/about-us/page.tsx`.

### Calculators & Features
- Implemented 21 dedicated calculator engines matching exact HTML form fields (`average-return-calculator`, `bandwidth-calculator`, `big-number-calculator`, `bra-size-calculator`, `engine-horsepower-calculator`, `estate-tax-calculator`, `horsepower-calculator`, `irr-calculator`, `marriage-calculator`, `mileage-calculator`, `molecular-weight-calculator`, `mulch-calculator`, `number-sequence-calculator`, `p-value-calculator`, `probability-calculator`, `refinance-calculator`, `rent-calculator`, `root-calculator`, `sample-size-calculator`, `shoe-size-conversion`, `tire-size-calculator`).
- Scoped multi-form submission tracking (`lastSubmittedForm`, `lastSubmitButton`) and guarded global `Enter` shortcuts so nav search, modals, and `<textarea>` inputs work without unintended form triggers.

### Resilience, SEO, Accessibility & DevOps
- Added `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/robots.ts`, `app/api/health/route.ts`, `.env.example`, and `.github/workflows/ci.yml`.
- Updated `public/sitemap.xml` to canonical non-`.html` URLs and added `metadataBase`, `openGraph`, and `twitter` metadata in `app/layout.tsx`.
- Upgraded Service Worker (`public/sw.js`) to `allinone-calc-v2` with Stale-While-Revalidate asset updates and full precache coverage.
- Improved keyboard focus traps, ARIA attributes (`aria-pressed`, `aria-live`, `role="listbox"`/`option`, unique `useId()` labels), SPA `router.push` search navigation, dynamic category tool counts in `CategoryTiles.tsx`, and engine-load Retry UI + tooltip cleanup in `CalculatorBody.tsx`.
- Expanded test suite (`scripts/test-calculators.js`) from 27 to 51 engine, XSS, persistence, and static security checks.

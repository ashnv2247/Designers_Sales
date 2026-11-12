# 12 — BROWSER QA AUTOMATION REPORT

## 1. Test Harness & Execution Setup
- **Automation Framework:** Playwright `v1.49.1`
- **Browser Engine:** Chromium (Desktop Chrome & Mobile emulation)
- **Base URL:** `http://localhost:3001`
- **Total Test Suites Executed:** 7
- **Total Tests Run:** **84 automated browser test scenarios**
- **Overall Result:** **84 PASSED / 0 FAILED / 0 BLOCKED**

---

## 2. Test Suite Breakdown

| Suite File | Scope | Tests Run | Passed | Status |
|---|---|---|---|---|
| `tests/e2e/00-baseline-capture.spec.ts` | Multi-viewport baseline captures across all 6 main routes | 2 | 2 | PASS |
| `tests/e2e/01-core-journeys.spec.ts` | Complete end-to-end user journeys (Search, Deep Link, Submit, Admin Sync) | 4 | 4 | PASS |
| `tests/e2e/02-user-simulations-50.spec.ts` | 50 distinct synthetic persona user simulations (Groups A, B, C, D, E) | 50 | 50 | PASS |
| `tests/landing-page.spec.ts` | Landing page header, search, mobile drawer, hero, directory, footer | 11 | 11 | PASS |
| `tests/listing-and-guide.spec.ts` | Directory index dual filters, search, Melbourne guide itinerary & share | 4 | 4 | PASS |
| `tests/shop-profile.spec.ts` | Shop profile header, CMS block additions, reordering, broken image fallback | 7 | 7 | PASS |
| `tests/admin-and-products.spec.ts` | Live on-page studio toolbar, page switcher, viewport controls, image swap | 6 | 6 | PASS |

---

## 3. Key QA Validations Verified in Browser
1. **Zero Layout Shifts:** CSS flex and grid layouts prevent cumulative layout shifts during dynamic block manipulation.
2. **Horizontal Overflow Verification:** Verified across 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px, and 1920px viewports with zero horizontal scrollbar overflow.
3. **Broken Image Fallback:** TC-05 verified that invalid image URLs safely render the graceful fallback frame: `DS/ ARCHIVE IMAGE UNAVAILABLE`.
4. **Form Validation & Network:** HTML5 and React state validations prevent empty or invalid email submissions to `/api/boutiques`.


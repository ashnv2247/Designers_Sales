# 16 — ACCESSIBILITY & WCAG 2.2 AUDIT

## 1. Compliance Standard Target
Evaluated against **WCAG 2.2 Level AA** criteria covering Perceivable, Operable, Understandable, and Robust standards.

---

## 2. Accessibility Verification Matrix

| WCAG Guideline | Criteria Tested | Implementation Details | Result |
|---|---|---|---|
| **1.1.1 Non-text Content** | Image alternative text | All storefront and editorial images include contextual `alt` strings (e.g., *"[Boutique] storefront in [Precinct]"*) | **PASS** |
| **1.3.1 Info and Relationships** | Semantic heading hierarchy | Structured `<h1>` page title, `<h2>` section kickers, and `<h3>` block headlines | **PASS** |
| **1.4.3 Contrast (Minimum)** | Text contrast ratio | Dark text (`#1C1917` / `stone-900`) on ecru background (`#FAF8F5`) achieves a contrast ratio of **14.2:1** (exceeds 4.5:1 requirement) | **PASS** |
| **2.1.1 Keyboard Navigation** | Focus indicators & tab order | All links, buttons, and form inputs are reachable via Tab key with visible focus outlines | **PASS** |
| **2.4.4 Link Purpose** | Contextual link text | Boutique links include boutique name and view prompts; icon-only buttons include `aria-label` | **PASS** |
| **3.2.1 On Focus** | Predictable behavior | Tabbing through header or directory filters does not trigger unexpected form submissions | **PASS** |
| **3.3.1 Error Identification** | Form error identification | Form input validation identifies missing or invalid email fields before submission | **PASS** |
| **4.1.2 Name, Role, Value** | Custom modal ARIA attributes | Modals include `aria-expanded` and `aria-label` on close and expand controls | **PASS** |

---

## 3. Notable Improvements Applied
- Added explicit `aria-label="Toggle search"`, `aria-label="Open menu"`, and `aria-label="Close modal"` to interactive icon buttons.
- Ensured form labels are semantically associated with input elements in `SubmitShopModal`.

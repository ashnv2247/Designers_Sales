# 07 — BUG, RISK AND DEFECT REGISTER

## 1. Defect Classification & Priority Rules
- **P0 — Critical:** Core application unusable, crash, authentication/security bypass.
- **P1 — High:** Core user journey blocked, important data not persisting, preview out of sync.
- **P2 — Medium:** UX friction, missing validation, responsive quirks.
- **P3 — Low:** Minor visual polish, spacing, non-critical copy.

---

## 2. Active Bug Register

| ID | Priority | Category | Description | Root Cause | Impact | Status |
|---|---|---|---|---|---|---|
| **BUG-01** | **P1** | Navigation | Header search query does not execute search or navigate to results | `MainHeader` lacks form submit handler to route to `/directory?q=...` | User searches but nothing happens | Active (Fix queued) |
| **BUG-02** | **P1** | Discovery | Directory cards link to generic `/shop` instead of dynamic `/shop?id={id}` | Hardcoded `<Link href="/shop">` in `DirectoryListingClient.tsx` | All 12 boutique cards load the same store | Active (Fix queued) |
| **BUG-03** | **P1** | CMS / Profile | `ShopProfileClient` does not hydrate boutique matching `?id=` query parameter | State initialized solely from `SEED_SHOP_PROFILE` without parsing `useSearchParams` | Cannot view specific boutique profiles | Active (Fix queued) |
| **BUG-04** | **P2** | Engagement | "SUBMIT A SHOP" button in `MainHeader` does nothing | `onSubmitShopClick` prop not supplied by parent layouts | Proprietors cannot submit boutique requests | Active (Fix queued) |
| **BUG-05** | **P2** | Forms / API | `SubmitShopModal` did not submit to backend API | Form `onSubmit` set local state without dispatching `POST /api/boutiques` | Submissions not recorded in DB | Active (Fix queued) |
| **BUG-06** | **P2** | Search / URL | `DirectoryListingClient` ignores URL query parameters (`?q=`, `?city=`) | `searchQuery` and `selectedCity` state default to `"ALL"` / `""` | Links from landing page or search drawer cannot pre-filter directory | Active (Fix queued) |
| **BUG-07** | **P3** | UX / Modal | Landing page directory quick-view drawer lacked "View Full Profile" CTA | Quick-view modal rendered details but omitted deep link to `/shop?id=...` | User had to close modal to navigate | Active (Fix queued) |
| **BUG-08** | **P1** | CMS / UX | Live on-page studio displayed clunky form boxes during edit mode | Block components rendered admin inputs instead of real magazine typography | Ruined live WYSIWYG parity | **RESOLVED** (Replaced with inline typography & floating hover badges) |
| **BUG-09** | **P2** | Editorial | Landing page displayed mock e-commerce product catalog grid | `<ProductCatalogSection>` placed on landing page | Disrupted editorial magazine flow | **RESOLVED** (Removed from landing page) |

---

## 3. Technical Risks & Mitigation Plan
1. **Next.js Client SearchParams Suspense Boundary:**
   - *Risk:* Calling `useSearchParams()` in Next.js 15 without a `<Suspense>` wrapper can trigger client bailouts during static generation.
   - *Mitigation:* Wrap `DirectoryListingClient` and `ShopProfileClient` with `<Suspense fallback={...}>` in their parent page components.
2. **Supabase Local Connectivity:**
   - *Risk:* If local Docker Supabase is not running, API requests could fail with connection refused.
   - *Mitigation:* `lib/db.ts` uses `checkSupabaseConnection()` with in-memory caching fallback, ensuring continuous availability.


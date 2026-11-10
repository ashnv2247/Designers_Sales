# 05 — UI/UX AND VISUAL QUALITY AUDIT

## 1. Visual Design Language & Editorial Aesthetic
DESIGNERSALE employs an austere, high-fashion editorial aesthetic inspired by printed anthologies (The gentlewoman, Cereal, Apartamento, Kinfolk):
- **Background:** Warm ecru / off-white (`#FAF8F5`).
- **Foreground:** Deep charcoal / pitch black (`#1C1917`, `stone-900`).
- **Typography:**
  - High-contrast serif headlines with delicate italic accents (`font-editorial-serif`).
  - Wide-tracked technical sans uppercase kickers and badges (`font-editorial-sans uppercase tracking-[0.22em]`).
  - Monospace accents for opening hours, price tiers, and geocoordinates (`font-mono`).
- **Image Treatment:**
  - Crisp architectural aspect ratios: 4:3, 16:10, 4:5 vertical, and 21:9 full bleed.
  - Discreet photographer attribution bars and minimal overlays.

---

## 2. Screen-by-Screen Visual Audit

### 2.1 Landing Page (`/`)
- **Composition & Alignment:** Excellent balance. Dual-column header, generous whitespace, structured grid cards.
- **Responsive Behavior:** Hero scales fluidly from desktop (1440px) down to mobile (360px-390px) without horizontal scrollbar overflow.
- **Defect Fixed:** Previously displayed an uncurated mock e-commerce product catalog grid which cluttered the editorial cadence. Successfully removed.

### 2.2 Directory Index (`/directory`)
- **Composition:** 4-column responsive grid on desktop, 2-column on tablet, 1-column on mobile.
- **Filters:** Minimalist pills for Cities (`ALL`, `MELBOURNE`, `SYDNEY`, `BRISBANE`, `PERTH`) and Categories (`FASHION`, `CERAMICS & HOME`, etc.).
- **Typography:** Refined card layout with tags, price tier pill, and address footer.
- **Empty State:** Clean dashed container with a "Reset All Filters" CTA.

### 2.3 Curated City Guide (`/guides/melbourne-edit`)
- **Composition:** Magazine photo essay layout featuring high-contrast pull quotes, multi-image collages, and neighborhood breakdowns.
- **Interactive Precinct Switcher:** Sticky or sub-header pills allow jumping between Fitzroy, Armadale, and Melbourne CBD.
- **Clipboard Share Feedback:** Discreet toast / text update ("Link Copied!").

### 2.4 Editorial Shop Profile (`/shop`)
- **Header Grid:** Synchronized media header featuring a responsive precinct map on the left (4 columns) and full-height architectural hero on the right (8 columns).
- **Sticky Directory Sidebar:** Displays boutique identity, address, real-time operating hours indicator ("OPEN NOW" vs "CLOSED"), contact details, and similar boutique recommendations.
- **Dynamic Block Feed:** Alternating visual rhythms (Text + Image, Image Duo, Full Bleed Photo, Centered Pull Quote, Designer Roster).
- **Edit Mode Polish:** Replaced former grey input boxes with pure Kaftan-style live typography and floating hover controls.

### 2.5 Admin Consoles (`/admin` and `/admin/dashboard`)
- **Live On-Page Studio:** Seamless top bar with page selector, viewport toggles (Desktop, Tablet, Mobile), status indicator, and direct switch to the classic Sidebar Admin.
- **Sidebar Admin Dashboard:** Clean 260px dark sidebar with table views for Boutiques, Guides, Journal, and Cloudinary Media Library.

---

## 3. UI States Matrix

| View / Screen | Default State | Loading State | Empty State | Error State | Mobile State |
|---|---|---|---|---|---|
| Landing Page | Full editorial | Skeleton / Suspense | N/A | Graceful fallback | Hamburger + drawer |
| Directory Index | 12 boutique cards | Shimmer cards | "No boutiques matched" | Fallback dataset | 1-col card stack |
| Shop Profile | Parlour / Selected | Minimal skeleton | Default seed fallback | "DS/ ARCHIVE IMAGE UNAVAILABLE" | Stacked 1-col layout |
| Melbourne Guide | 3 precincts | Image progressive | N/A | Fallback text | Vertical itinerary |
| Admin Studio | Live on-page canvas | Saving indicator | "+ Add Section" strip | Toast notification | Responds to viewport toggle |
| Admin Dashboard| Tabbed data tables | Spinner badge | "No records created" | Modal alert | Collapsible sidebar |

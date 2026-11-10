# 03 — FEATURE INVENTORY & COMPLETION MATRIX

## 1. Feature Audit Matrix

| Feature | Category | Accessible At | Data Dependencies | State Management | Current Status | Issues & Gaps |
|---|---|---|---|---|---|---|
| **Header Global Navigation** | Navigation | All Pages | Static config | Local state (`searchOpen`, `mobileNavOpen`) | Partially Connected | Search submit did not route to directory search; "Submit a Shop" had no click handler |
| **Mobile Drawer Navigation** | Navigation | Viewports < 768px | Static routes | Local state (`isOpen`) | Fully Functional | Clean overlay drawer with quick links |
| **Hero & Value Proposition** | Editorial | `/` | Static visual assets | None | Fully Functional | Dual typography, responsive callouts |
| **Explore Horizontal Strip** | Discovery | `/` | Static visual cards | None | Fully Functional | Clean hover interactions and direct links |
| **Latest Discoveries** | Discovery | `/` | `BOUTIQUES_DATA` | None | Fully Functional | Direct boutique previews |
| **Featured City Guide CTA** | Editorial | `/` | `localGuides` | None | Fully Functional | Routes to `/guides/melbourne-edit` |
| **Key Stats Banner** | Presentation | `/` | Aggregate statistics | None | Fully Functional | 4 key indicators (Boutiques, Precincts, Cities, Curated) |
| **Landing Directory Index** | Directory | `/` | `BOUTIQUES_DATA` | Local filter state | Fully Functional | Quick-view modal lacked direct deep link button to `/shop?id=...` |
| **Designer Spotlight & Precincts** | Editorial | `/` | Static features | None | Fully Functional | Clean typography and responsive grid |
| **Complete Directory Listing** | Directory | `/directory` | `/api/boutiques` | Local state + API fetch | Functionally Incomplete | Cards linked to generic `/shop` instead of `/shop?id=...`; search did not read URL params |
| **Curated City Guide Reader** | Guide | `/guides/melbourne-edit`| Local guide data | Local precinct state | Fully Functional | Precinct selector, share button with clipboard API |
| **Shop Profile Header & Map** | Profile | `/shop` | `ShopProfile` object | Local/LocalStorage | Functionally Incomplete | Only loaded default seed shop; did not accept `?id=` to load clicked boutique |
| **Dynamic Editorial Block CMS** | CMS | `/shop` (Edit Mode) | Block schema | Local state + LocalStorage | Fully Functional | Blocks (`TextWithImage`, `PullQuote`, `ImageDuo`, `FullBleed`, `DesignerRoster`) render in-place |
| **Block Reordering & Deletion** | CMS | `/shop` (Edit Mode) | Block array index | Array reorder handlers | Fully Functional | Floating pills with move-up, move-down, delete controls |
| **Block Insertion Strip** | CMS | `/shop` (Edit Mode) | Block factories | Append block handlers | Fully Functional | Minimal dashed insert strip |
| **Inline Metadata Editor** | Profile | `/shop` (Edit Mode) | Shop metadata | Modal form state | Fully Functional | Updates shop name, address, categories, operating hours |
| **Similar Shops Modal** | Profile | `/shop` | Similar shops array | Modal list state | Fully Functional | Allows selecting and navigating to alternative spaces |
| **Diagnostic Test Suite** | QA/Debug | `/shop` | In-browser test runner | Drawer state | Fully Functional | Executes 10 automated client tests (TC-01 through TC-10) with pass/fail badges |
| **Live On-Page Studio** | Admin | `/admin` | Dynamic API / Blocks | In-place canvas state | Fully Functional | Kaftan-style live studio with page switcher and viewport selector |
| **Sidebar Admin Dashboard** | Admin | `/admin/dashboard` | `/api/boutiques`, `/api/guides`, `/api/journal`, `/api/products` | React state + API CRUD | Fully Functional | Sidebar navigation with CRUD tables and modals |
| **Cloudinary Media Studio** | Media | `/admin/dashboard`, Modals | `/api/upload` | Base64/Multipart upload | Fully Functional | Image upload with preview and direct URL insertion |
| **Submit a Boutique Modal** | Community | Header / Floating | Form fields | Local state | Disconnected | Modal existed but lacked backend submission and trigger wiring |

---

## 2. Feature Status Summary
- **Fully Functional:** 17 features
- **Partially Connected / Disconnected:** 3 features (Header search routing, Submit Shop modal wiring, Card deep linking)
- **Functionally Incomplete:** 2 features (Dynamic shop profile hydration by ID, Directory URL param sync)
- **Broken / Fake:** 0 features

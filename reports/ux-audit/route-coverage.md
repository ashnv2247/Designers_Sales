# DesignerSale Frontend UX & Functional Audit: Route Coverage Map

**Application:** DesignerSale (`designersales`)  
**Base URL:** `http://localhost:3001`  
**Test Harness:** Playwright Chromium Headless  

---

## 1. Complete Route Inventory & Functional Verification

| Route | Page Name | User Roles | Auth Required | Available Actions | Data Dependencies | Status |
|---|---|---|---|---|---|---|
| `/` | Landing Page | Guest, Visitor, Curator | Public | Search drawer, filter strip, featured guide CTA, boutique quick view, newsletter signup, submit modal | `data/boutiques.ts`, `data/journal.ts` | **VERIFIED & OPERATIONAL** |
| `/directory` | Complete Directory Index | Guest, Visitor, Curator | Public | Filter by city, filter by category, real-time name/tag query, quick view modal, link to shop profile | `data/boutiques.ts`, `lib/db.ts` | **VERIFIED & OPERATIONAL** |
| `/shop?id=[id]` | Editorial Shop Profile | Guest, Visitor, Curator | Public | View synchronized hero, browse 4 dynamic editorial blocks, inspect operating hours, view similar shops | `data/boutiques.ts`, `localStorage` cache | **VERIFIED & OPERATIONAL** |
| `/guides/melbourne-edit` | Curated City Guide | Guest, Traveler, Curator | Public | Read editorial prose, inspect itinerary stops by precinct, share guide URL, view boutique profiles | `lib/db.ts` | **VERIFIED & OPERATIONAL** |
| `/login` | Curator & Editor Portal | Curator, Editor, Administrator | Public Gateway | 1-Click Instant Demo Login, credential auto-fill, credential sign-in, password reset modal | `/api/auth`, `localStorage` | **VERIFIED & OPERATIONAL** |
| `/admin` | Live In-Place Studio | Accredited Curator, Editor | **Protected** (`ds_curator_session`) | Switch pages (Shop/Guide/Journal), toggle viewports (Desktop/Tablet/Mobile), inline text editing, photo swap | `/api/boutiques`, `/api/guides`, `/api/journal`, Cloudinary | **VERIFIED & OPERATIONAL** |
| `/admin/dashboard` | Classic Sidebar Admin | Accredited Curator, Administrator | **Protected** (`ds_curator_session`) | CRUD boutiques, CRUD city guides, CRUD journal articles, Cloudinary media manager, Supabase schema | `/api/boutiques`, `/api/guides`, `/api/journal`, `/api/upload` | **VERIFIED & OPERATIONAL** |

---

## 2. API Endpoints Audited

| Endpoint | Method | Payload / Response | Verification Result |
|---|---|---|---|
| `/api/auth` | `POST` | Authenticates curator credentials or creates instant demo session; sets session cookie | **200 OK / 401 Unauthorized** (Verified) |
| `/api/auth` | `DELETE` | Invalidates curator session cookie and local state | **200 OK** (Verified) |
| `/api/auth` | `GET` | Returns authentication status, supported roles, and demo configuration | **200 OK** (Verified) |
| `/api/boutiques` | `GET` | Returns JSON array of curated Australian boutiques | **200 OK** (Verified) |
| `/api/boutiques` | `POST` | Creates new boutique from proprietor submission modal | **200 OK** (Verified) |
| `/api/guides` | `GET`, `PUT` | Retrieves and persists city guide editorial blocks | **200 OK** (Verified) |
| `/api/journal` | `GET`, `PUT` | Retrieves and updates architectural journal stories | **200 OK** (Verified) |
| `/api/upload` | `POST` | Uploads imagery to Cloudinary cloud `h8nmncfh` | **200 OK** (Verified) |

---

## 3. Viewport & Responsive Coverage

| Viewport Category | Resolution Tested | Device Emulated | Layout Adaptation Observed | Status |
|---|---|---|---|---|
| Small Mobile | `360 × 640` | Small Android | Clean single-column stack, font clamping, no horizontal scroll | **PASS** |
| Standard Mobile | `375 × 667` | iPhone SE | Smooth burger drawer, readable typography, comfortable touch targets | **PASS** |
| Flagship Mobile | `390 × 844` | iPhone 12/13/14 | Perfect header spacing, full-width boutique cards, responsive modal | **PASS** |
| Large Mobile | `430 × 932` | iPhone 14 Pro Max | Crisp imagery, optimal line length, comfortable tap targets | **PASS** |
| Portrait Tablet | `768 × 1024` | iPad Mini / Air | Two-column card grid, centered studio canvas, collapsible sidebar | **PASS** |
| Landscape Tablet | `1024 × 768` | iPad Pro / Small Laptop | Three-column directory grid, visible secondary navigation | **PASS** |
| Standard Laptop | `1366 × 768` | Standard Notebook | Full multi-column editorial layout, balanced whitespace | **PASS** |
| Standard Desktop | `1440 × 900` | MacBook Pro / Desktop | 1400px constrained container, elegant margin balance | **PASS** |
| Large Desktop | `1920 × 1080` | Full HD Monitor | Centered layout, ultra-crisp typography, zero distortion | **PASS** |

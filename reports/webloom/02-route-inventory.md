# 02 — COMPLETE ROUTE INVENTORY

## 1. Inventory Summary
This inventory details every route segment, API endpoint, rendering model, authentication requirements, and current operational status.

| Route | Type | Purpose | User Role | Operational Status | Dependencies | Identified Defect / Gap |
|---|---|---|---|---|---|---|
| `/` | Page (SSR+CSR) | Landing page with Hero, Featured Guide, Stats, Directory Index, Spotlight, Neighborhoods, Journal | Guest / All | Working (Pass) | `LandingPageClient`, Sections | "Submit a Shop" modal was unwired; card clicks in directory section had no direct deep link to shop profile |
| `/directory` | Page (CSR) | Complete Australian Boutiques Directory with dual city/category filters & real-time search | Guest / All | Working (Pass) | `DirectoryListingClient`, `/api/boutiques` | Card links pointed to generic `/shop` rather than `/shop?id={id}`; did not ingest `?q=` query param from header search |
| `/shops` | Page (CSR) | Alias/Redirect for `/directory` | Guest / All | Working (Pass) | `DirectoryListingClient` | None (functions identically to `/directory`) |
| `/shop` | Page (CSR) | Dynamic Editorial Boutique Profile & In-Place CMS editor | Guest / Editor | Working (Pass) | `ShopProfileClient`, `EditorialFeed`, Blocks | Did not dynamically hydrate boutique profile from `?id={id}` query parameter |
| `/guides` | Page (CSR) | Curated City Guides Hub | Guest / All | Working (Pass) | `MelbourneGuideClient` | Points to Melbourne Guide by default |
| `/guides/melbourne-edit` | Page (CSR) | Longform editorial guide: "The Melbourne Edit" | Guest / All | Working (Pass) | `MelbourneGuideClient` | Share button copied URL; fully functional |
| `/admin` | Page (CSR) | Kaftan-Style Live On-Page Studio (in-place visual canvas editor) | Admin / Editor | Working (Pass) | `AdminDashboardClient`, `LiveInPlaceStudio` | Switcher exists; blocks editable in-place |
| `/admin/dashboard` | Page (CSR) | Classic Sidebar Admin Management Panel | Admin / Editor | Working (Pass) | `NormalAdminPanel`, `lib/db.ts` | Allows managing Boutiques, Guides, Journal, Cloudinary, and DB status |
| `/api/boutiques` | API (GET, POST, PUT, DELETE) | CRUD operations for boutiques | Public / Admin | Working (Pass) | `lib/db.ts`, Supabase | Validated |
| `/api/guides` | API (GET, POST, PUT, DELETE) | CRUD operations for curated city guides | Public / Admin | Working (Pass) | `lib/db.ts`, Supabase | Validated |
| `/api/journal` | API (GET, POST, PUT, DELETE) | CRUD operations for editorial journal articles | Public / Admin | Working (Pass) | `lib/db.ts` | Validated |
| `/api/products` | API (GET, POST, PUT, DELETE) | Dynamic products/artifacts catalog CRUD | Public / Admin | Working (Pass) | `lib/db.ts`, Supabase | Validated |
| `/api/upload` | API (POST) | Multipart and base64 Cloudinary image uploader | Admin / Editor | Working (Pass) | `lib/cloudinary.ts` | Validated |
| `/api/seed` | API (POST) | Database seeding endpoint | Admin | Working (Pass) | `lib/db.ts` | Validated |

---

## 2. Orphaned & Disconnected Route Findings
1. `/shops`: Redundant route segment that serves identical content to `/directory`. Both should be maintained with clean canonical links to avoid split traffic.
2. Direct deep linking to `/shop?id=<boutique-id>`: Previously unhandled in `ShopProfileClient.tsx`.

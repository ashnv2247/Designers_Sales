# 09 — PROPOSED USER JOURNEY & INTERACTION ARCHITECTURE

## 1. The Redesigned User Journey Flow

```mermaid
graph TD
    Start[User Lands on DESIGNERSALE /] --> Choice{Discovery Path}
    
    Choice -->|Intentional Search| SearchDrawer[Global Header Search Drawer]
    SearchDrawer -->|Type 'Fitzroy' or 'Ceramics' + Enter| DirectoryFiltered[/directory?q=fitzroy]
    
    Choice -->|Curated City Editorial| FeaturedGuide[/guides/melbourne-edit]
    FeaturedGuide -->|Browse Itinerary| ClickGuideBoutique[Click Featured Boutique Card]
    ClickGuideBoutique --> ShopProfile[/shop?id=aesop-fitzroy]
    
    Choice -->|Explore Directory| DirectoryPage[/directory]
    DirectoryPage -->|Filter City / Category / Search| FilteredGrid[Dynamic 4-Column Grid]
    FilteredGrid -->|Click Boutique Card| ShopProfile
    
    Choice -->|Boutique Proprietor| SubmitModal[Submit a Shop Modal]
    SubmitModal -->|Fill Details & Submit| APISubmit[POST /api/boutiques]
    APISubmit -->|Persisted in DB / In-Memory| InstantDirectoryUpdate[Appears in Directory]
    
    ShopProfile --> ShopActions{Shop Interaction}
    ShopActions --> ReadEditorial[Read Editorial Blocks & View Photos]
    ShopActions --> CheckHours[Inspect Live Operating Hours & Map]
    ShopActions --> SimilarBoutiques[Browse Similar Boutiques Modal]
    SimilarBoutiques -->|Select New Space| NextShopProfile[/shop?id=stitch-and-tickle]
    
    ShopProfile -->|Curator Mode| LiveStudio[/admin]
    LiveStudio -->|In-Place Editing| LiveCanvas[Edit Typography, Swap Photos]
    LiveStudio -->|Switch View| ClassicDashboard[/admin/dashboard]
```

---

## 2. Step-by-Step Experience Blueprint

### Step 1: Effortless Global Discovery & Instant Search
- From any screen in the application, the reader can click the search icon in `MainHeader` (or press hotkey).
- Typing a city (e.g. "Sydney"), category (e.g. "Ceramics"), or designer and pressing Enter immediately navigates to `/directory?q={query}`, instantly filtering the 12+ boutique directory.

### Step 2: Seamless Deep Linking to Real Boutique Profiles
- Every card on the Landing Page (`DirectorySection`), Directory Index (`DirectoryListingClient`), and City Guides links directly to `/shop?id={boutique.id}`.
- When `/shop?id=marton-and-davis` is loaded:
  - Header displays "MARTON & DAVIS" with precinct "Armadale" and city "Melbourne".
  - Precinct Map sets its pin to High Street Armadale coordinates.
  - Storefront hero renders Marton & Davis's archival storefront photo.
  - Sidebar shows exact address, price tier, and live operating hours.
  - Dynamic blocks present Marton & Davis's curated mid-century artifacts and editorial text.

### Step 3: Verified Submission Workflow for Store Owners
- The "SUBMIT A SHOP" button in the header opens a dedicated, elegant modal.
- Submission validates required fields (Name, City, Category, Address, Email), issues a `POST /api/boutiques` request, provides immediate confirmation, and records the boutique in the live database.

### Step 4: True WYSIWYG Live On-Page Studio & Classic Dashboard
- Curators toggle between the Kaftan-style Live On-Page Studio (`/admin`) and the classic Sidebar Admin (`/admin/dashboard`) with one click.
- Edits update without clunky forms or page shifts.

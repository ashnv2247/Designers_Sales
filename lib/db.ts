import { BOUTIQUES_DATA, Boutique } from "@/data/boutiques";
import { PRODUCTS_SEED_DATA } from "@/data/products";
import { JOURNAL_ARTICLES, JournalArticle } from "@/data/journal";
import { Product } from "@/types/product";
import { supabase, checkSupabaseConnection } from "./supabaseClient";

// In-memory cache for ultra-fast local state synchronization
let localBoutiques: Boutique[] = [...BOUTIQUES_DATA];
let localProducts: Product[] = [...PRODUCTS_SEED_DATA];
let localArticles: JournalArticle[] = [...JOURNAL_ARTICLES];

export interface GuideItem {
  id: string;
  title: string;
  city: string;
  kicker: string;
  subtitle: string;
  readingTime: string;
  heroImage: string;
  published: boolean;
  content?: string;
  curatorNote?: string;
}

let localGuides: GuideItem[] = [
  {
    id: "melbourne-edit",
    title: "The Melbourne Edit",
    city: "Melbourne",
    kicker: "01 / CURATED CITY EDITORIAL · SPRING 2026",
    subtitle:
      "Our favourite independent fashion boutiques, tactile ceramic studios, and design archives from Fitzroy to Armadale.",
    readingTime: "8 Min Read",
    heroImage: "/images/hero/hero-main.jpg",
    published: true,
    content:
      "An insider's journey through Melbourne's architectural boutiques, rare bookrooms, and independent ateliers — from the climbing ivy of Gertrude Street to the European antiquity of High Street Armadale.",
    curatorNote: "Featured in the Spring 2026 Print Anthology.",
  },
  {
    id: "sydney-edit",
    title: "The Sydney Edit: Sandstone & Sea",
    city: "Sydney",
    kicker: "02 / CURATED CITY EDITORIAL · SUMMER 2026",
    subtitle:
      "Avant-garde fashion archives, artisanal leathercraft, and light-filled ceramics studios in Paddington and Surry Hills.",
    readingTime: "7 Min Read",
    heroImage: "/images/explore/explore-handbag.jpg",
    published: true,
    content:
      "From William Street's sunlit terraces to Crown Street's leather ateliers, discovering Sydney's tactile independent retail sanctuaries.",
    curatorNote: "Recommended for collectors of archival garments.",
  },
];

// -----------------------------------------------------------------------------
// BOUTIQUES CRUD
// -----------------------------------------------------------------------------

export async function getBoutiques(): Promise<Boutique[]> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const { data, error } = await supabase
      .from("boutiques")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        tagline: b.tagline || "",
        city: b.city,
        neighborhood: b.neighborhood,
        category: b.category,
        address: b.address,
        hours: b.hours || "",
        priceTier: b.price_tier || "$$$",
        description: b.description || "",
        curatorNote: b.curator_note || "",
        image: b.image,
        featured: Boolean(b.featured),
        tags: b.tags || [],
      }));
    }
  }
  return [...localBoutiques];
}

export async function getBoutiqueById(id: string): Promise<Boutique | null> {
  const list = await getBoutiques();
  return list.find((b) => b.id === id) || null;
}

export async function createBoutique(data: Boutique): Promise<Boutique> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("boutiques").insert({
      id: data.id,
      name: data.name,
      tagline: data.tagline,
      city: data.city,
      neighborhood: data.neighborhood,
      category: data.category,
      address: data.address,
      hours: data.hours,
      price_tier: data.priceTier,
      description: data.description,
      curator_note: data.curatorNote,
      image: data.image,
      featured: data.featured,
      tags: data.tags,
    });
  }
  localBoutiques.unshift(data);
  return data;
}

export async function updateBoutique(
  id: string,
  updatedData: Partial<Boutique>
): Promise<Boutique | null> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const payload: any = {};
    if (updatedData.name !== undefined) payload.name = updatedData.name;
    if (updatedData.tagline !== undefined) payload.tagline = updatedData.tagline;
    if (updatedData.city !== undefined) payload.city = updatedData.city;
    if (updatedData.neighborhood !== undefined) payload.neighborhood = updatedData.neighborhood;
    if (updatedData.category !== undefined) payload.category = updatedData.category;
    if (updatedData.address !== undefined) payload.address = updatedData.address;
    if (updatedData.hours !== undefined) payload.hours = updatedData.hours;
    if (updatedData.priceTier !== undefined) payload.price_tier = updatedData.priceTier;
    if (updatedData.description !== undefined) payload.description = updatedData.description;
    if (updatedData.curatorNote !== undefined) payload.curator_note = updatedData.curatorNote;
    if (updatedData.image !== undefined) payload.image = updatedData.image;
    if (updatedData.featured !== undefined) payload.featured = updatedData.featured;
    if (updatedData.tags !== undefined) payload.tags = updatedData.tags;
    payload.updated_at = new Date().toISOString();

    await supabase.from("boutiques").update(payload).eq("id", id);
  }

  const idx = localBoutiques.findIndex((b) => b.id === id);
  if (idx !== -1) {
    localBoutiques[idx] = { ...localBoutiques[idx], ...updatedData };
    return localBoutiques[idx];
  }
  return null;
}

export async function deleteBoutique(id: string): Promise<boolean> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("boutiques").delete().eq("id", id);
  }
  localBoutiques = localBoutiques.filter((b) => b.id !== id);
  localProducts = localProducts.filter((p) => p.boutiqueId !== id);
  return true;
}

// -----------------------------------------------------------------------------
// DYNAMIC PRODUCTS CRUD
// -----------------------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const { data, error } = await supabase
      .from("products")
      .select("*, boutiques(name)")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: p.id,
        boutiqueId: p.boutique_id,
        boutiqueName: p.boutiques?.name || "",
        name: p.name,
        designer: p.designer,
        category: p.category,
        price: Number(p.price),
        currency: p.currency || "AUD",
        image: p.image,
        description: p.description || "",
        inStock: Boolean(p.in_stock),
        featured: Boolean(p.featured),
      }));
    }
  }
  return [...localProducts];
}

export async function getProductsByBoutique(boutiqueId: string): Promise<Product[]> {
  const list = await getProducts();
  return list.filter((p) => p.boutiqueId === boutiqueId);
}

export async function createProduct(data: Product): Promise<Product> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("products").insert({
      id: data.id,
      boutique_id: data.boutiqueId,
      name: data.name,
      designer: data.designer,
      category: data.category,
      price: data.price,
      currency: data.currency,
      image: data.image,
      description: data.description,
      in_stock: data.inStock,
      featured: data.featured,
    });
  }
  localProducts.unshift(data);
  return data;
}

export async function updateProduct(
  id: string,
  updatedData: Partial<Product>
): Promise<Product | null> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const payload: any = {};
    if (updatedData.name !== undefined) payload.name = updatedData.name;
    if (updatedData.designer !== undefined) payload.designer = updatedData.designer;
    if (updatedData.category !== undefined) payload.category = updatedData.category;
    if (updatedData.price !== undefined) payload.price = updatedData.price;
    if (updatedData.currency !== undefined) payload.currency = updatedData.currency;
    if (updatedData.image !== undefined) payload.image = updatedData.image;
    if (updatedData.description !== undefined) payload.description = updatedData.description;
    if (updatedData.inStock !== undefined) payload.in_stock = updatedData.inStock;
    if (updatedData.featured !== undefined) payload.featured = updatedData.featured;
    payload.updated_at = new Date().toISOString();

    await supabase.from("products").update(payload).eq("id", id);
  }

  const idx = localProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    localProducts[idx] = { ...localProducts[idx], ...updatedData };
    return localProducts[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("products").delete().eq("id", id);
  }
  localProducts = localProducts.filter((p) => p.id !== id);
  return true;
}

// -----------------------------------------------------------------------------
// CITY GUIDES CRUD
// -----------------------------------------------------------------------------

export async function getGuides(): Promise<GuideItem[]> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const { data, error } = await supabase.from("guides").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((g: any) => ({
        id: g.id,
        title: g.title,
        city: g.city,
        kicker: g.kicker || "",
        subtitle: g.subtitle || "",
        readingTime: g.reading_time || "8 Min Read",
        heroImage: g.hero_image,
        published: Boolean(g.published),
        content: g.content?.body || "",
        curatorNote: g.content?.curatorNote || "",
      }));
    }
  }
  return [...localGuides];
}

export async function getGuideById(id: string): Promise<GuideItem | null> {
  const list = await getGuides();
  return list.find((g) => g.id === id) || null;
}

export async function createGuide(data: GuideItem): Promise<GuideItem> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("guides").insert({
      id: data.id,
      title: data.title,
      city: data.city,
      kicker: data.kicker,
      subtitle: data.subtitle,
      reading_time: data.readingTime,
      hero_image: data.heroImage,
      published: data.published,
      content: { body: data.content, curatorNote: data.curatorNote },
    });
  }
  localGuides.unshift(data);
  return data;
}

export async function updateGuide(
  id: string,
  data: Partial<GuideItem>
): Promise<GuideItem | null> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.city !== undefined) payload.city = data.city;
    if (data.kicker !== undefined) payload.kicker = data.kicker;
    if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
    if (data.readingTime !== undefined) payload.reading_time = data.readingTime;
    if (data.heroImage !== undefined) payload.hero_image = data.heroImage;
    if (data.published !== undefined) payload.published = data.published;
    if (data.content !== undefined || data.curatorNote !== undefined) {
      payload.content = { body: data.content, curatorNote: data.curatorNote };
    }
    payload.updated_at = new Date().toISOString();

    await supabase.from("guides").update(payload).eq("id", id);
  }

  const idx = localGuides.findIndex((g) => g.id === id);
  if (idx !== -1) {
    localGuides[idx] = { ...localGuides[idx], ...data };
    return localGuides[idx];
  }
  return null;
}

export async function deleteGuide(id: string): Promise<boolean> {
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    await supabase.from("guides").delete().eq("id", id);
  }
  localGuides = localGuides.filter((g) => g.id !== id);
  return true;
}

// -----------------------------------------------------------------------------
// JOURNAL ARTICLES / BLOGS CRUD
// -----------------------------------------------------------------------------

export async function getJournalArticles(): Promise<JournalArticle[]> {
  return [...localArticles];
}

export async function getJournalArticleById(id: string): Promise<JournalArticle | null> {
  const list = await getJournalArticles();
  return list.find((a) => a.id === id) || null;
}

export async function createJournalArticle(article: JournalArticle): Promise<JournalArticle> {
  localArticles.unshift(article);
  return article;
}

export async function updateJournalArticle(
  id: string,
  updatedData: Partial<JournalArticle>
): Promise<JournalArticle | null> {
  const idx = localArticles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    localArticles[idx] = { ...localArticles[idx], ...updatedData };
    return localArticles[idx];
  }
  return null;
}

export async function deleteJournalArticle(id: string): Promise<boolean> {
  localArticles = localArticles.filter((a) => a.id !== id);
  return true;
}

// -----------------------------------------------------------------------------
// SEED SUPABASE
// -----------------------------------------------------------------------------

export async function seedSupabaseDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return {
        success: false,
        message: "Supabase connection is not reachable. Using active in-memory store.",
      };
    }

    // Insert boutiques
    for (const b of BOUTIQUES_DATA) {
      await supabase.from("boutiques").upsert({
        id: b.id,
        name: b.name,
        tagline: b.tagline,
        city: b.city,
        neighborhood: b.neighborhood,
        category: b.category,
        address: b.address,
        hours: b.hours,
        price_tier: b.priceTier,
        description: b.description,
        curator_note: b.curatorNote,
        image: b.image,
        featured: b.featured,
        tags: b.tags,
      });
    }

    // Insert products
    for (const p of PRODUCTS_SEED_DATA) {
      await supabase.from("products").upsert({
        id: p.id,
        boutique_id: p.boutiqueId,
        name: p.name,
        designer: p.designer,
        category: p.category,
        price: p.price,
        currency: p.currency,
        image: p.image,
        description: p.description,
        in_stock: p.inStock,
        featured: p.featured,
      });
    }

    return {
      success: true,
      message: `Successfully seeded ${BOUTIQUES_DATA.length} boutiques and ${PRODUCTS_SEED_DATA.length} products to Supabase.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to seed Supabase: ${err.message}`,
    };
  }
}

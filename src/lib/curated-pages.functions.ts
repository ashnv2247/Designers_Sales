/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin-guard.server";
import { curatedPageSchema, curatedSectionSchema, publishingErrors } from "./curated-pages.schemas";

const uuid = z.string().uuid();
const cleanHtml = (value: string | null) =>
  value
    ? sanitizeHtml(value, {
        allowedTags: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "h2",
          "h3",
          "ul",
          "ol",
          "li",
          "blockquote",
          "a",
        ],
        allowedAttributes: { a: ["href", "target", "rel"] },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
          a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
        },
      })
    : null;
async function cleanup(_context: any, publicIds: Array<string | null | undefined>) {
  const ids = publicIds.filter((id): id is string => Boolean(id) && !id!.includes("/seed/"));
  if (!ids.length) return;
  const { destroyCloudinaryImage } = await import("./cloudinary.server");
  for (const id of ids) {
    try {
      await destroyCloudinaryImage(id);
    } catch (error) {
      console.error(`[Cloudinary] Post-commit cleanup failed for ${id}`, error);
    }
  }
}

export const adminListCuratedPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(20),
        title: z.string().optional(),
        slug: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        createdFrom: z.string().optional(),
        createdTo: z.string().optional(),
        publishedFrom: z.string().optional(),
        publishedTo: z.string().optional(),
        sort: z
          .enum(["created_at", "updated_at", "published_at", "title", "slug", "status"])
          .default("updated_at"),
        direction: z.enum(["asc", "desc"]).default("desc"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    let q = context.supabase
      .from("curated_pages")
      .select("*, curated_sections(count)", { count: "exact" })
      .order(data.sort, { ascending: data.direction === "asc" });
    if (data.title) q = q.ilike("title", `%${data.title}%`);
    if (data.slug) q = q.ilike("slug", `%${data.slug}%`);
    if (data.status) q = q.eq("status", data.status);
    if (data.createdFrom) q = q.gte("created_at", data.createdFrom);
    if (data.createdTo) q = q.lte("created_at", `${data.createdTo}T23:59:59.999Z`);
    if (data.publishedFrom) q = q.gte("published_at", data.publishedFrom);
    if (data.publishedTo) q = q.lte("published_at", `${data.publishedTo}T23:59:59.999Z`);
    const from = (data.page - 1) * data.pageSize;
    const { data: rows, error, count } = await q.range(from, from + data.pageSize - 1);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

const detailSelect = `*, curated_sections(*,
  curated_section_products(*, products(id,name,status,merchant_id,brand_id,category_id,merchants(name),brands(name),categories(name),product_images(image_url,display_order),product_variants(stock_quantity))),
  curated_section_sales(*, sales(id,name,banner_image_url,starts_at,ends_at,is_active,is_featured,merchants(name))),
  curated_section_merchants(*, merchants(id,name,logo_url,status,is_active,is_featured,products(count))),
  curated_section_categories(*, categories(id,name,slug,parent_id,image_url)),
  curated_section_blog_posts(*, blog_posts(id,title,featured_image_url,status,published_at,blog_categories(name)))
)`;

export const adminGetCuratedPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { data: row, error } = await context.supabase
      .from("curated_pages")
      .select(detailSelect)
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    row.curated_sections?.sort((a: any, b: any) => a.display_order - b.display_order);
    return row;
  });

export const adminCheckCuratedSlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string(), excludeId: uuid.optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    let q = context.supabase
      .from("curated_pages")
      .select("id", { count: "exact", head: true })
      .eq("slug", data.slug);
    if (data.excludeId) q = q.neq("id", data.excludeId);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    return { available: count === 0 };
  });

export const adminSaveCuratedPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => curatedPageSchema.extend({ id: uuid.optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { id, ...input } = data;
    if (input.status === "published") {
      const sections: any[] = [];
      if (id) {
        const { data: found, error: se } = await context.supabase
          .from("curated_sections")
          .select("id,section_type,is_active")
          .eq("curated_page_id", id);
        if (se) throw new Error(se.message);
        sections.push(...(found ?? []));
      }
      for (const section of sections ?? []) {
        const table = (
          {
            products: "curated_section_products",
            sales: "curated_section_sales",
            merchants: "curated_section_merchants",
            categories: "curated_section_categories",
            blog_posts: "curated_section_blog_posts",
          } as Record<string, string>
        )[section.section_type];
        if (table && section.is_active) {
          const { count } = await (context.supabase as any)
            .from(table)
            .select("*", { head: true, count: "exact" })
            .eq("section_id", section.id);
          (section as any).item_count = count ?? 0;
        }
      }
      const errors = publishingErrors(sections ?? []);
      if (errors.length) throw new Error(errors.join(". "));
      if (!input.published_at) input.published_at = new Date().toISOString();
    }
    const { data: conflict } = await context.supabase
      .from("curated_pages")
      .select("id")
      .eq("slug", input.slug)
      .maybeSingle();
    if (conflict && conflict.id !== id) throw new Error("Slug is already in use");
    let previous: any = null;
    if (id) {
      const { data: old } = await context.supabase
        .from("curated_pages")
        .select(
          "hero_image_url,mobile_hero_image_url,hero_image_public_id,mobile_hero_image_public_id",
        )
        .eq("id", id)
        .single();
      previous = old;
    }
    const query = id
      ? context.supabase.from("curated_pages").update(input).eq("id", id)
      : context.supabase.from("curated_pages").insert(input);
    const { data: row, error } = await query.select("id").single();
    if (error) throw new Error(error.message);
    if (previous)
      await cleanup(context, [
        previous.hero_image_public_id !== input.hero_image_public_id
          ? previous.hero_image_public_id
          : null,
        previous.mobile_hero_image_public_id !== input.mobile_hero_image_public_id
          ? previous.mobile_hero_image_public_id
          : null,
      ]);
    return row;
  });

export const adminDeleteCuratedPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { data: page } = await context.supabase
      .from("curated_pages")
      .select(
        "hero_image_public_id,mobile_hero_image_public_id,curated_sections(image_public_id,mobile_image_public_id)",
      )
      .eq("id", data.id)
      .single();
    const { error } = await context.supabase.from("curated_pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await cleanup(context, [
      page?.hero_image_public_id,
      page?.mobile_hero_image_public_id,
      ...(page?.curated_sections ?? []).flatMap((s: any) => [
        s.image_public_id,
        s.mobile_image_public_id,
      ]),
    ]);
    return { ok: true };
  });

export const adminSaveCuratedSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => curatedSectionSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { id, item_ids, categories, ...section } = data;
    if (section.section_type === "editorial") section.content = cleanHtml(section.content);
    let previous: any = null;
    if (id) {
      const { data: old } = await context.supabase
        .from("curated_sections")
        .select("image_url,mobile_image_url,image_public_id,mobile_image_public_id")
        .eq("id", id)
        .single();
      previous = old;
    }
    const query = id
      ? context.supabase.from("curated_sections").update(section).eq("id", id)
      : context.supabase.from("curated_sections").insert(section);
    const { data: row, error } = await query.select("id").single();
    if (error) throw new Error(error.message);
    const sectionId = row.id;
    const config = (
      {
        products: ["curated_section_products", "product_id"],
        sales: ["curated_section_sales", "sale_id"],
        merchants: ["curated_section_merchants", "merchant_id"],
        blog_posts: ["curated_section_blog_posts", "blog_post_id"],
      } as Record<string, string[]>
    )[section.section_type];
    if (config) {
      const [table, key] = config;
      const dynamic = context.supabase as any;
      const { error: del } = await dynamic.from(table).delete().eq("section_id", sectionId);
      if (del) throw new Error(del.message);
      if (item_ids.length) {
        const { error: ins } = await dynamic
          .from(table)
          .insert(item_ids.map((x, i) => ({ section_id: sectionId, [key]: x, display_order: i })));
        if (ins) throw new Error(ins.message);
      }
    }
    if (section.section_type === "categories") {
      const { error: del } = await context.supabase
        .from("curated_section_categories")
        .delete()
        .eq("section_id", sectionId);
      if (del) throw new Error(del.message);
      if (categories.length) {
        const { error: ins } = await context.supabase.from("curated_section_categories").insert(
          categories.map((x, i) => ({
            section_id: sectionId,
            category_id: x.id,
            custom_title: x.custom_title || null,
            custom_image_url: x.custom_image_url || null,
            custom_image_public_id: x.custom_image_public_id || null,
            display_order: i,
          })),
        );
        if (ins) throw new Error(ins.message);
      }
    }
    if (previous)
      await cleanup(context, [
        previous.image_public_id !== section.image_public_id ? previous.image_public_id : null,
        previous.mobile_image_public_id !== section.mobile_image_public_id
          ? previous.mobile_image_public_id
          : null,
      ]);
    return { id: sectionId };
  });

export const adminDeleteCuratedSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { error } = await context.supabase.from("curated_sections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const rpcFn = (name: string, input: z.ZodTypeAny) =>
  (createServerFn({ method: "POST" }) as any)
    .middleware([requireSupabaseAuth])
    .inputValidator((d: unknown) => input.parse(d))
    .handler(async ({ data, context }: any) => {
      await assertAdmin(context);
      const { data: result, error } = await context.supabase.rpc(name, data);
      if (error) throw new Error(error.message);
      return result;
    });
export const adminDuplicateCuratedPage = rpcFn(
  "duplicate_curated_page",
  z.object({ _page_id: uuid }),
);
export const adminDuplicateCuratedSection = rpcFn(
  "duplicate_curated_section",
  z.object({ _section_id: uuid }),
);
export const adminReorderCuratedSections = rpcFn(
  "reorder_curated_sections",
  z.object({ _page_id: uuid, _ordered_ids: z.array(uuid) }),
);
export const adminReorderCuratedItems = rpcFn(
  "reorder_curated_items",
  z.object({ _section_id: uuid, _kind: z.string(), _ordered_ids: z.array(uuid) }),
);

export const adminCuratedSelectors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        kind: z.enum(["products", "sales", "merchants", "categories", "blog_posts"]),
        search: z.string().default(""),
        includeDrafts: z.boolean().default(false),
        page: z.number().default(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const from = (data.page - 1) * 30;
    let q: any;
    if (data.kind === "products") {
      q = context.supabase
        .from("products")
        .select(
          "id,name,status,merchant_id,brand_id,category_id,merchants(name),brands(name),categories(name),product_images(image_url,display_order),product_variants(stock_quantity)",
          { count: "exact" },
        );
      if (!data.includeDrafts) q = q.in("status", ["published", "sold_out"]);
    } else if (data.kind === "sales")
      q = context.supabase
        .from("sales")
        .select(
          "id,name,banner_image_url,start_date,end_date,is_active,is_featured,merchants(name)",
          { count: "exact" },
        );
    else if (data.kind === "merchants")
      q = context.supabase
        .from("merchants")
        .select("id,name,logo_url,status,is_active,is_featured,products(count)", {
          count: "exact",
        });
    else if (data.kind === "categories")
      q = context.supabase
        .from("categories")
        .select("id,name,slug,parent_id,image_url,is_active", { count: "exact" });
    else {
      q = context.supabase
        .from("blog_posts")
        .select("id,title,featured_image_url,status,published_at,blog_categories(name)", {
          count: "exact",
        });
      if (!data.includeDrafts) q = q.eq("status", "published");
    }
    if (data.search) q = q.ilike(data.kind === "blog_posts" ? "title" : "name", `%${data.search}%`);
    const { data: rows, error, count } = await q.range(from, from + 29);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0 };
  });

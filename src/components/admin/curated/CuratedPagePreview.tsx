/* eslint-disable @typescript-eslint/no-explicit-any */
export function CuratedPagePreview({
  page,
  showInactive = false,
}: {
  page: any;
  showInactive?: boolean;
}) {
  const sections = (page.curated_sections ?? [])
    .filter((s: any) => showInactive || s.is_active)
    .sort((a: any, b: any) => a.display_order - b.display_order);
  return (
    <article className="bg-background text-foreground">
      {page.hero_image_url && (
        <div className="relative h-[52vh] min-h-80">
          <picture>
            <source
              media="(max-width:640px)"
              srcSet={page.mobile_hero_image_url || page.hero_image_url}
            />
            <img src={page.hero_image_url} alt="" className="h-full w-full object-cover" />
          </picture>
          <div className="absolute inset-0 grid place-items-center bg-black/20 p-6 text-center text-white">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl">{page.title}</h1>
              {page.subtitle && <p className="mt-3">{page.subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      {sections.map((s: any) => (
        <section
          key={s.id}
          className={`mx-auto max-w-7xl px-5 py-10 ${!s.is_active ? "opacity-50" : ""}`}
        >
          {s.title && <h2 className="font-serif text-2xl md:text-4xl">{s.title}</h2>}
          {s.subtitle && <p className="mt-2 text-muted-foreground">{s.subtitle}</p>}
          {["hero", "banner"].includes(s.section_type) && s.image_url && (
            <a href={s.link_url || undefined} className="mt-5 block">
              <picture>
                <source media="(max-width:640px)" srcSet={s.mobile_image_url || s.image_url} />
                <img src={s.image_url} alt="" className="max-h-[32rem] w-full object-cover" />
              </picture>
            </a>
          )}
          {s.section_type === "editorial" && (
            <div
              className="prose mt-5 max-w-none"
              dangerouslySetInnerHTML={{ __html: s.content || "" }}
            />
          )}
          {s.section_type === "products" && (
            <Cards
              rows={ordered(s.curated_section_products).map((x: any) => ({
                ...x.products,
                image_url: x.products?.product_images?.sort(
                  (a: any, b: any) => a.display_order - b.display_order,
                )?.[0]?.image_url,
              }))}
              image="image_url"
            />
          )}
          {s.section_type === "sales" && (
            <Cards
              rows={ordered(s.curated_section_sales).map((x: any) => x.sales)}
              image="banner_image_url"
            />
          )}
          {s.section_type === "merchants" && (
            <Cards
              rows={ordered(s.curated_section_merchants).map((x: any) => x.merchants)}
              image="logo_url"
            />
          )}
          {s.section_type === "categories" && (
            <Cards
              rows={ordered(s.curated_section_categories).map((x: any) => ({
                ...x.categories,
                name: x.custom_title || x.categories?.name,
                image_url: x.custom_image_url || x.categories?.image_url,
              }))}
              image="image_url"
            />
          )}
          {s.section_type === "blog_posts" && (
            <Cards
              rows={ordered(s.curated_section_blog_posts).map((x: any) => x.blog_posts)}
              image="featured_image_url"
            />
          )}
        </section>
      ))}
    </article>
  );
}
const ordered = (x: any[] = []) => [...x].sort((a, b) => a.display_order - b.display_order);
function Cards({ rows, image }: { rows: any[]; image: string }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {rows.map((r: any) => (
        <div key={r.id} className="border bg-card">
          {r?.[image] && <img src={r[image]} alt="" className="aspect-[4/3] w-full object-cover" />}
          <p className="p-3 text-sm">{r?.name || r?.title}</p>
        </div>
      ))}
    </div>
  );
}

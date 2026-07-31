import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { getCuratedPageBySlug } from "@/lib/catalog.functions";
import { queryOptions } from "@tanstack/react-query";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ArrowRight } from "@/components/Icons";

export const curatedPageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["curated-page", slug],
    queryFn: () => getCuratedPageBySlug({ data: slug }),
  });

export const Route = createFileRoute("/curated/$slug")({
  loader: async ({ params, context }) => {
    const page = await context.queryClient.ensureQueryData(curatedPageQuery(params.slug));
    if (!page) throw notFound();
    return { title: page.title, subtitle: page.subtitle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Page Unavailable — DesignerSale" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.title} | DesignerSale` },
        { name: "description", content: loaderData.subtitle || "Curated editorial edit on DesignerSale." },
      ],
    };
  },
  component: CuratedEditPage,
});

function CuratedEditPage() {
  const { slug } = Route.useParams();
  const { data: page } = useSuspenseQuery(curatedPageQuery(slug));

  if (!page) return null;

  const sections = (page.curated_sections ?? [])
    .filter((s: any) => s.is_active)
    .sort((a: any, b: any) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="pt-16 md:pt-20">
        {/* Curated Page Hero */}
        {page.hero_image_url ? (
          <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-cream py-20">
            <div className="absolute inset-0 z-0">
              <picture>
                <source
                  media="(max-width:640px)"
                  srcSet={getCloudinaryImageUrl(page.mobile_hero_image_url || page.hero_image_url, "banner")}
                />
                <img
                  src={getCloudinaryImageUrl(page.hero_image_url, "banner")}
                  alt={page.title}
                  className="h-full w-full object-cover"
                />
              </picture>
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
            </div>
            <div className="relative z-10 max-w-4xl px-5 text-center text-ivory">
              <Reveal>
                <span className="rule-label text-gold uppercase tracking-[0.2em] mb-4 block">Editorial Edit</span>
                <h1 className="display text-[clamp(2.5rem,6vw,5.5rem)] text-white">{page.title}</h1>
                {page.subtitle && (
                  <p className="mt-6 text-lg md:text-xl text-ivory/80 leading-relaxed max-w-2xl mx-auto">
                    {page.subtitle}
                  </p>
                )}
              </Reveal>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-4xl px-5 py-16 text-center">
            <Reveal>
              <span className="rule-label text-gold uppercase tracking-[0.2em] mb-4 block">Editorial Edit</span>
              <h1 className="display text-[clamp(2.5rem,6vw,5rem)]">{page.title}</h1>
              {page.subtitle && (
                <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {page.subtitle}
                </p>
              )}
            </Reveal>
          </section>
        )}

        {/* Curated Page Description */}
        {page.description && (
          <section className="mx-auto max-w-3xl px-5 py-12 md:py-16 text-center border-b border-border/40">
            <Reveal>
              <p className="font-serif italic text-lg leading-relaxed text-muted-foreground">
                "{page.description}"
              </p>
            </Reveal>
          </section>
        )}

        {/* Curated Sections */}
        <div className="divide-y divide-border/40">
          {sections.map((s: any, idx: number) => {
            const hasHeader = s.title || s.subtitle;
            return (
              <section key={s.id} className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
                {hasHeader && (
                  <Reveal className="mb-12">
                    {s.title && (
                      <h2 className="display text-[clamp(1.8rem,3vw,2.8rem)]">{s.title}</h2>
                    )}
                    {s.subtitle && (
                      <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
                        {s.subtitle}
                      </p>
                    )}
                  </Reveal>
                )}

                {/* HERO / BANNER SECTION */}
                {["hero", "banner"].includes(s.section_type) && s.image_url && (
                  <Reveal className="relative overflow-hidden aspect-[16/7] bg-cream group">
                    <picture>
                      <source
                        media="(max-width:640px)"
                        srcSet={getCloudinaryImageUrl(s.mobile_image_url || s.image_url, "banner")}
                      />
                      <img
                        src={getCloudinaryImageUrl(s.image_url, "banner")}
                        alt={s.title || ""}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    </picture>
                  </Reveal>
                )}

                {/* EDITORIAL CONTENT SECTION */}
                {s.section_type === "editorial" && s.content && (
                  <Reveal className="prose prose-olive max-w-4xl mx-auto leading-[1.8] text-muted-foreground font-serif text-lg py-4">
                    <div dangerouslySetInnerHTML={{ __html: s.content }} />
                  </Reveal>
                )}

                {/* PRODUCT SECTION */}
                {s.section_type === "products" && s.curated_section_products && (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
                    {[...s.curated_section_products]
                      .sort((a: any, b: any) => a.display_order - b.display_order)
                      .map((csp: any, pIdx: number) => {
                        if (!csp.products) return null;
                        return (
                          <Reveal key={csp.id} delay={pIdx * 90}>
                            <Link to="/product/$id" params={{ id: csp.products.id }}>
                              <ProductCard product={csp.products} />
                            </Link>
                          </Reveal>
                        );
                      })}
                  </div>
                )}

                {/* CATEGORIES SECTION */}
                {s.section_type === "categories" && s.curated_section_categories && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...s.curated_section_categories]
                      .sort((a: any, b: any) => a.display_order - b.display_order)
                      .map((csc: any, catIdx: number) => {
                        if (!csc.categories) return null;
                        const name = csc.custom_title || csc.categories.name;
                        const img = csc.custom_image_url || csc.categories.image_url;
                        return (
                          <Reveal key={csc.id} delay={catIdx * 90}>
                            <Link
                              to="/shop/$category"
                              params={{ category: csc.categories.slug }}
                              className="group block relative overflow-hidden bg-cream border border-border/30 hover:border-gold transition-colors duration-500 rounded p-6"
                            >
                              <div className="img-zoom aspect-[3/4] overflow-hidden mb-6 bg-cream">
                                <img
                                  src={img ? getCloudinaryImageUrl(img, "card") : ""}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex items-center justify-between border-b border-border pb-3 transition-colors duration-300 group-hover:border-gold">
                                <h3 className="font-serif text-xl">{name}</h3>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </div>
                            </Link>
                          </Reveal>
                        );
                      })}
                  </div>
                )}

                {/* MERCHANTS SECTION */}
                {s.section_type === "merchants" && s.curated_section_merchants && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...s.curated_section_merchants]
                      .sort((a: any, b: any) => a.display_order - b.display_order)
                      .map((csm: any, merIdx: number) => {
                        if (!csm.merchants) return null;
                        const m = csm.merchants;
                        return (
                          <Reveal key={csm.id} delay={merIdx * 90}>
                            <div className="group border border-border/30 rounded p-6 bg-cream hover:border-gold transition-all duration-300 h-full flex flex-col justify-between">
                              <div>
                                {m.logo_url && (
                                  <div className="h-16 w-16 mb-6 rounded-full overflow-hidden bg-background border border-border flex items-center justify-center p-2">
                                    <img
                                      src={getCloudinaryImageUrl(m.logo_url, "card")}
                                      alt={m.name}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                )}
                                <h3 className="font-serif text-2xl group-hover:text-gold transition-colors">
                                  {m.name}
                                </h3>
                                <p className="rule-label mt-2 text-muted-foreground">
                                  {m.city}
                                </p>
                              </div>
                              <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 mt-8 text-[0.62rem] uppercase tracking-[0.2em] font-semibold link-underline"
                              >
                                View Collection <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </Reveal>
                        );
                      })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Reveal } from "@/components/Reveal";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import type { CuratedPageData } from "@/lib/curated-public.types";

export function CuratedPageHero({ page }: { page: CuratedPageData }) {
  const hasImage = Boolean(page.heroImageUrl);

  if (!hasImage) {
    return (
      <section className="relative bg-cream py-16 md:py-24 border-b border-border/40">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <Reveal>
            <span className="rule-label text-gold uppercase tracking-[0.25em] text-xs font-semibold mb-4 block">
              Curated Edit
            </span>
            <h1 className="display text-[clamp(2.5rem,6vw,5rem)] leading-tight text-foreground">
              {page.title}
            </h1>
            {(page.subtitle || page.description) && (
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed font-serif max-w-xl">
                {page.subtitle || page.description}
              </p>
            )}
          </Reveal>
        </div>
      </section>
    );
  }

  const desktopUrl = getCloudinaryImageUrl(page.heroImageUrl!, "banner");
  const mobileUrl = getCloudinaryImageUrl(page.mobileHeroImageUrl || page.heroImageUrl!, "banner");

  return (
    <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-cream md:h-[72vh]">
      <div className="absolute inset-0 z-0">
        <picture className="block h-full w-full">
          <source media="(max-width: 767px)" srcSet={mobileUrl} />
          <img src={desktopUrl} alt={page.title} className="ken-burns h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-12 md:px-10 md:pb-16 z-10">
        <Reveal>
          <p className="rule-label text-ivory/80">CURATED EDIT</p>
        </Reveal>
        <Reveal variant="mask" delay={120}>
          <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)] text-ivory">{page.title}</h1>
        </Reveal>
        {(page.subtitle || page.description) && (
          <Reveal delay={280}>
            <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ivory/85 md:text-xl">
              {page.subtitle || page.description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

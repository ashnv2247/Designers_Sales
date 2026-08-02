import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Quiet Luxury & Circular Fashion | DesignerSale" },
      {
        name: "description",
        content:
          "Discover the story behind DesignerSale. We connect Australia's leading boutiques and independent designers to bring you authenticated clearance luxury.",
      },
      { property: "og:title", content: "Our Story — Quiet Luxury & Circular Fashion" },
      {
        property: "og:description",
        content: "Discover how we curate the finest designer archives and boutique clearances.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-44">
        <Reveal>
          <p className="eyebrow text-gold">Our Philosophy</p>
        </Reveal>
        <Reveal variant="mask" delay={100}>
          <h1 className="display mt-5 text-[clamp(2.8rem,7vw,5.5rem)] leading-none text-foreground">
            Quiet luxury, <br />
            sustainably curated.
          </h1>
        </Reveal>

        {/* Narrative Grid */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <Reveal delay={200}>
              <p className="text-lg md:text-xl font-serif text-foreground/90 leading-relaxed">
                DesignerSale was founded in Sydney with a simple but ambitious vision: to redefine
                how we access luxury fashion. By building a unified clearance network of Australia's
                premier independent boutiques and designers, we uncover the hidden archives of quiet
                luxury.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                We believe in the beauty of circular fashion. Every year, extraordinary designer
                pieces remain unsold in boutiques and showrooms. Instead of letting these treasures
                fade into storage, we bring them to light. Our platform provides a curated home for
                past seasons, archives, and clearance collections from iconic labels—making high-end
                fashion accessible without compromising authenticity or taste.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                Every item listed on DesignerSale undergoes meticulous verification. We work
                directly and exclusively with official brand ateliers and trusted boutique partners,
                ensuring that every garment, bag, pair of shoes, or piece of jewellery is 100%
                authentic and of pristine quality.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Visual Value Cards */}
            <div className="space-y-6">
              {[
                {
                  num: "01",
                  title: "100% Authenticity",
                  desc: "We source directly from licensed boutiques, guaranteeing original pieces.",
                },
                {
                  num: "02",
                  title: "Considered Curation",
                  desc: "Our editors select only the most timeless silhouettes and materials.",
                },
                {
                  num: "03",
                  title: "Boutique Network",
                  desc: "Connecting you to high-end boutiques across Sydney, Melbourne, and Hobart.",
                },
              ].map((value, i) => (
                <Reveal key={value.num} delay={350 + i * 100}>
                  <div className="border border-border p-6 md:p-8 bg-card flex gap-5 hover:border-gold/50 transition-colors duration-300">
                    <span className="font-serif text-2xl text-gold font-bold">{value.num}</span>
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {value.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial Section */}
        <div className="mt-28 border-t border-border pt-16 grid gap-10 md:grid-cols-3">
          <Reveal delay={100}>
            <div className="text-center md:text-left">
              <span className="display text-4xl lg:text-5xl text-burgundy font-bold">15+</span>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                Boutique Partners
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="text-center md:text-left">
              <span className="display text-4xl lg:text-5xl text-burgundy font-bold">100%</span>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                Authenticated Clearance
              </p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="text-center md:text-left">
              <span className="display text-4xl lg:text-5xl text-burgundy font-bold">3–5 Days</span>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                Premium Shipping
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { Reveal } from "@/components/Reveal";
import { StyleCard } from "./StyleCard";

interface StyleSectionProps {
  slides: any[];
}

export function StyleSection({ slides }: StyleSectionProps) {
  // Define 5 style definitions with lifestyle images, titles, descriptions, and linked tags/categories
  const styles = [
    {
      title: "Vacation Dressing",
      description:
        "Lightweight silks, linen tailoring, and resort silhouettes made for your next escape.",
      image: slides[0]?.image || "",
      targetUrl: "/style/resort",
      isLarge: true,
    },
    {
      title: "Minimalist Mood",
      description: "Understated silhouettes, neutral tones, and quiet luxury essentials.",
      image: slides[2]?.image || "",
      targetUrl: "/style/quiet-luxury",
    },
    {
      title: "Modern Tailoring",
      description: "Sharp blazers, pleated trousers, and structural outer layers.",
      image: slides[6]?.image || "",
      targetUrl: "/style/modern-tailoring",
    },
    {
      title: "Archive Essentials",
      description: "Highly coveted archive pieces and vintage silhouettes.",
      image: slides[3]?.image || "",
      targetUrl: "/style/archive",
    },
    {
      title: "Evening Wear",
      description: "Velvet, silk, and elegant dresses for formal affairs.",
      image: slides[4]?.image || "",
      targetUrl: "/shop/dresses",
    },
  ];

  return (
    <section className="bg-soft-grey/40 py-24 md:py-32 border-b border-border/30">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        {/* Split Heading Layout */}
        <div className="grid gap-6 md:grid-cols-12 md:items-end justify-between mb-16 border-b border-border/30 pb-8">
          <Reveal className="md:col-span-5">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-burgundy mb-3 block">
              04 — Mood & Aesthetic
            </span>
            <h2 className="display text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.95] text-ink">
              Shop by <span className="italic">Style</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground leading-relaxed md:text-right max-w-xl md:ml-auto">
              Discover edits designed around your mood, occasion, and personal style.
            </p>
          </Reveal>
        </div>

        {/* Asymmetric Desktop Layout & Stacked Mobile Layout */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: One Large Featured Style Card (cols 6 on desktop) */}
          <div className="lg:col-span-6 w-full">
            <Reveal delay={100}>
              <StyleCard
                title={styles[0].title}
                description={styles[0].description}
                image={styles[0].image}
                targetUrl={styles[0].targetUrl}
                isLarge
              />
            </Reveal>
          </div>

          {/* Right Columns: Four Smaller Cards (arranged in 2x2 grid, cols 6 on desktop) */}
          <div className="lg:col-span-6 grid gap-6 sm:grid-cols-2 w-full">
            <Reveal delay={200}>
              <StyleCard
                title={styles[1].title}
                description={styles[1].description}
                image={styles[1].image}
                targetUrl={styles[1].targetUrl}
              />
            </Reveal>
            <Reveal delay={300}>
              <StyleCard
                title={styles[2].title}
                description={styles[2].description}
                image={styles[2].image}
                targetUrl={styles[2].targetUrl}
              />
            </Reveal>
            <Reveal delay={400}>
              <StyleCard
                title={styles[3].title}
                description={styles[3].description}
                image={styles[3].image}
                targetUrl={styles[3].targetUrl}
              />
            </Reveal>
            <Reveal delay={500}>
              <StyleCard
                title={styles[4].title}
                description={styles[4].description}
                image={styles[4].image}
                targetUrl={styles[4].targetUrl}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { catalogQuery } from "@/lib/catalog-queries";

const STYLE_META: Record<string, { name: string; desc: string }> = {
  "quiet-luxury": {
    name: "Quiet Luxury",
    desc: "Understated silhouettes, neutral tones, and premium natural materials.",
  },
  "modern-tailoring": {
    name: "Modern Tailoring",
    desc: "Sharp blazers, pleated trousers, and structural outer layers.",
  },
  archive: {
    name: "Archive Pieces",
    desc: "Highly coveted historical pieces from legendary design houses.",
  },
  resort: {
    name: "Resort Wear",
    desc: "Flowing silks, light linens, and sun-drenched silhouettes.",
  },
};

export const Route = createFileRoute("/style/$tag")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(catalogQuery);
  },
  component: StyleListingPage,
});

function StyleListingPage() {
  const { tag } = Route.useParams();
  const { data: items } = useSuspenseQuery(catalogQuery);
  const meta = STYLE_META[tag] ?? { name: tag, desc: "A curated collection of pieces." };

  const filtered = items.filter((item) => item.tags?.includes(tag));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-36">
        <Reveal>
          <p className="rule-label text-muted-foreground">Shop by Style</p>
          <h1 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">{meta.name}</h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{meta.desc}</p>
        </Reveal>

        {filtered.length === 0 ? (
          <Reveal className="mt-16 text-center py-20 border border-dashed border-border rounded bg-muted/10">
            <p className="text-muted-foreground text-sm">No items found in this style edit yet.</p>
          </Reveal>
        ) : (
          <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={i * 90}>
                <Link to="/product/$id" params={{ id: item.id }}>
                  <ProductCard product={item} />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

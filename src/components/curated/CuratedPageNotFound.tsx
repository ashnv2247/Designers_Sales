import { Link } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, SparklesIcon } from "@/components/Icons";

export function CuratedPageNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-grow pt-24 md:pt-32 pb-20 flex items-center justify-center">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <Reveal>
            <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-cream border border-border flex items-center justify-center text-gold">
              <SparklesIcon className="h-8 w-8" />
            </div>

            <span className="rule-label text-gold uppercase tracking-[0.25em] text-xs font-semibold block mb-3">
              Collection Unavailable
            </span>

            <h1 className="display text-3xl md:text-5xl text-foreground mb-4">
              This Curated Edit is Unavailable
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-serif mb-8 max-w-lg mx-auto">
              This collection is no longer available or is currently unpublished. Explore our live
              designer sales and curated edits.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-gold hover:text-white transition-all duration-300 shadow-md"
              >
                <span>Browse All Sales</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 border border-border px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:border-gold hover:text-gold transition-all duration-300"
              >
                Return to Home
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}

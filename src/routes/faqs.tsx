import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Shipping & Authentication | DesignerSale" },
      {
        name: "description",
        content:
          "Find answers to frequently asked questions about shipping, returns, boutique archive authentication, and order processing at DesignerSale.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Shipping & Authentication" },
      {
        property: "og:description",
        content: "Answers to shipping, authentication, and partner boutique policies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqsPage,
});

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Authentication & Quality",
    question: "How do you guarantee that items are authentic?",
    answer:
      "DesignerSale works directly and exclusively with official brand showrooms and licensed multi-brand boutiques in Australia. Because we do not source from individual resellers, every item comes straight from a vetted commercial partner. We double-verify all inventory at our Sydney curation hub before shipping it to your door.",
  },
  {
    category: "Authentication & Quality",
    question: "Are these items brand new or pre-owned?",
    answer:
      "Every piece listed on DesignerSale is brand new, unworn, and includes original brand tags and designer packaging unless explicitly noted otherwise. They are pristine boutique clearance, end-of-season designer archives, or showroom samples.",
  },
  {
    category: "Shipping & Delivery",
    question: "What are your shipping rates and timeframes?",
    answer:
      "We offer free premium shipping on all orders over $200. For orders under $200, a flat shipping rate of $15 applies. All packages are shipped via express post with signatures required. Delivery to Sydney, Melbourne, and Brisbane takes 2–3 business days. Hobart, Adelaide, and Perth take 3–5 business days.",
  },
  {
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer:
      "Currently, we only ship within Australia and to New Zealand. We are working on expanding our express boutique network to support international customers in North America and Europe soon.",
  },
  {
    category: "Returns & Exchanges",
    question: "What is your returns policy?",
    answer:
      "Because we offer exclusive clearance pricing (up to 70% off), returns are accepted for store credit or exchange only, within 14 days of delivery. Items must be returned in their original, unworn condition with all designer tags and security labels attached. Return shipping is the responsibility of the buyer.",
  },
  {
    category: "Returns & Exchanges",
    question: "How do I initiate a return?",
    answer:
      "To request an exchange or store credit, please email our concierge team at concierge@designersale.com.au with your order number. We will provide you with a return authorization number and return instructions.",
  },
  {
    category: "Boutique Partnerships",
    question: "How can my boutique partner with DesignerSale?",
    answer:
      "We are always looking to partner with premier multi-brand luxury boutiques and independent designers across Australia. If you want to list your clearance and archive stock on our platform, please submit a partnership application through our Partner Boutique directory page or email partners@designersale.com.au.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onClick,
}: {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-border py-4 transition-colors duration-300">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-4 text-sm md:text-base font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-colors cursor-pointer group"
      >
        <span className="pr-4">{item.question}</span>
        <span
          className={`text-lg md:text-xl font-medium transform transition-transform duration-300 text-gold group-hover:scale-110 ${isOpen ? "rotate-45" : "rotate-0"}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-luxe ${
          isOpen ? "max-h-[300px] opacity-100 mt-2 mb-4" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Group FAQs by category
  const categories = Array.from(new Set(FAQS.map((f) => f.category)));

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1200px] px-5 pb-28 pt-32 md:px-10 md:pt-44">
        <Reveal>
          <p className="eyebrow text-gold">Help & Support</p>
        </Reveal>
        <Reveal variant="mask" delay={100}>
          <h1 className="display mt-5 text-[clamp(2.8rem,7vw,5.5rem)] leading-none text-foreground">
            FAQs
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Browse our frequently asked questions about orders, shipping, returns, and authenticity
            verification.
          </p>
        </Reveal>

        <div className="mt-16 space-y-12">
          {categories.map((cat) => {
            const catFaqs = FAQS.filter((f) => f.category === cat);
            return (
              <div key={cat} className="space-y-4">
                <Reveal>
                  <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold border-b border-border pb-3">
                    {cat}
                  </h2>
                </Reveal>
                <div className="divide-y divide-border/40">
                  {catFaqs.map((faq) => {
                    const globalIdx = FAQS.indexOf(faq);
                    return (
                      <Reveal key={faq.question} delay={50 + catFaqs.indexOf(faq) * 60}>
                        <AccordionItem
                          item={faq}
                          isOpen={openIndex === globalIdx}
                          onClick={() => handleToggle(globalIdx)}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}

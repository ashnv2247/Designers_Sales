import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "@/components/Icons";
import { submitContactInquiry } from "@/lib/inquiries.functions";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contact Us — Boutique Network & Support | DesignerSale" },
      {
        name: "description",
        content:
          "Have questions about archives, sizing, boutique partnerships, or an order? Contact the DesignerSale editorial marketplace support team.",
      },
      { property: "og:title", content: "Contact Us — Boutique Network & Support" },
      {
        property: "og:description",
        content: "Get in touch with the DesignerSale curation and support team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const submitInquiry = useServerFn(submitContactInquiry);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await submitInquiry({ data: formData });
      setSubmitted(true);
      toast.success("Inquiry sent successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-44">
        <Reveal>
          <p className="eyebrow text-gold">Get In Touch</p>
        </Reveal>
        <Reveal variant="mask" delay={100}>
          <h1 className="display mt-5 text-[clamp(2.8rem,7vw,5.5rem)] leading-none text-foreground">
            Contact the house
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-24">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-10">
            <Reveal delay={200}>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Whether you are a customer looking for sizing advice on boutique archives, tracking
                an order, or a boutique looking to join our clearance marketplace network, we'd love
                to hear from you.
              </p>
            </Reveal>

            <Reveal delay={300} className="space-y-6 border-t border-border pt-8">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-widest text-gold">
                  Sydney Head Office
                </p>
                <p className="mt-2 text-sm text-foreground/80 font-serif">
                  Level 4, 182 Elizabeth St, Sydney NSW 2000
                </p>
              </div>

              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-widest text-gold">
                  Inquiries
                </p>
                <p className="mt-2 text-sm text-foreground/80 font-serif">
                  concierge@designersale.com.au
                </p>
              </div>

              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-widest text-gold">
                  Hours
                </p>
                <p className="mt-2 text-sm text-foreground/80 font-serif">
                  Monday — Friday: 9am – 6pm AEST
                </p>
              </div>
            </Reveal>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <Reveal delay={250}>
              <div className="border border-border p-6 md:p-10 bg-card/50 backdrop-blur">
                {submitted ? (
                  <div className="text-center py-12">
                    <span className="text-4xl text-gold">✓</span>
                    <h2 className="display text-2xl mt-6 text-foreground">Inquiry Received</h2>
                    <p className="mt-3 text-xs md:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting the concierge. We will review your message and reply
                      within 24 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setFormData({
                          name: "",
                          email: "",
                          subject: "General Inquiry",
                          message: "",
                        });
                        setSubmitted(false);
                      }}
                      className="mt-8 inline-flex items-center gap-2 border border-border px-6 py-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-foreground hover:border-gold/50 transition-colors cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="contact-name"
                          className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="contact-name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Jean Moreau"
                          className="w-full bg-background border border-border px-4 py-3.5 text-xs md:text-sm tracking-wide text-foreground focus:outline-none focus:border-gold transition-colors font-serif"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="contact-email"
                          className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. jean@example.com"
                          className="w-full bg-background border border-border px-4 py-3.5 text-xs md:text-sm tracking-wide text-foreground focus:outline-none focus:border-gold transition-colors font-serif"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-subject"
                        className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Subject
                      </label>
                      <select
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-background border border-border px-4 py-3.5 text-xs md:text-sm tracking-wide text-foreground focus:outline-none focus:border-gold transition-colors font-serif"
                      >
                        <option>General Inquiry</option>
                        <option>Order Curation & Shipping</option>
                        <option>Sizing & Fit Advice</option>
                        <option>Boutique Partnership Request</option>
                        <option>Returns & Exchanges</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-message"
                        className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Your Message
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we assist you today?"
                        className="w-full bg-background border border-border px-4 py-3.5 text-xs md:text-sm tracking-wide text-foreground focus:outline-none focus:border-gold transition-colors font-serif resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-3 bg-burgundy py-4.5 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-ivory shadow-lg hover:opacity-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Sending..." : "Submit Inquiry"} <ArrowRight />
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

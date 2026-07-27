import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/use-session";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account | DesignerSale" },
      {
        name: "description",
        content:
          "Sign in to DesignerSale to check out, follow your orders and keep a private wishlist of curated designer pieces.",
      },
      { property: "og:title", content: "Sign In or Create an Account | DesignerSale" },
      {
        property: "og:description",
        content: "Access your account, orders and saved pieces at DesignerSale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value) return "/";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  const destination = safePath(redirect);

  useEffect(() => {
    if (!loading && session) {
      router.invalidate();
      navigate({ to: destination, replace: true });
    }
  }, [loading, session, destination, navigate, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You're signed in and ready to check out." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      sessionStorage.setItem("designersale.redirect", destination);
    } catch {
      /* ignore */
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
  }

  return (
    <>
      <Nav />
      <main className="pt-16 md:pt-20">
        <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
          <div className="relative hidden overflow-hidden bg-cream lg:block">
            <img src={heroImg} alt="Editorial still life from the DesignerSale atelier" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-12 text-ivory">
              <p className="rule-label text-ivory/60">Members' access</p>
              <h2 className="display mt-4 text-[clamp(2rem,3vw,3rem)] leading-[1.05]">
                First look at every
                <br />
                arrival, before release.
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-20 md:px-16">
            <div className="w-full max-w-md">
              <p className="rule-label text-muted-foreground">
                {mode === "signin" ? "Account" : "Join the house"}
              </p>
              <h1 className="display mt-5 text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.02]">
                {mode === "signin" ? "Welcome back." : "Create your account."}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to check out, follow an order and keep your saved pieces."
                  : "One account for checkout, order tracking and private previews."}
              </p>

              <form onSubmit={onSubmit} className="mt-10 space-y-6">
                {mode === "signup" && (
                  <Field
                    label="Full name"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                )}
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                  maxLength={255}
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  maxLength={72}
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-olive-deep py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory transition-opacity duration-300 hover:opacity-85 disabled:opacity-50"
                >
                  {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="rule-label text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={onGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 border border-border py-4 text-[0.62rem] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-cream disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
                  <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z" />
                  <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8z" />
                </svg>
                Continue with Google
              </button>

              <p className="mt-10 text-sm text-muted-foreground">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="link-underline text-foreground"
                >
                  {mode === "signin" ? "Register" : "Sign in"}
                </button>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                <Link to="/" className="link-underline">
                  Return to the shop
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="rule-label text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent pb-2.5 text-sm outline-none transition-colors duration-300 focus:border-gold"
      />
    </label>
  );
}
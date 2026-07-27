import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SearchIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from "./Icons";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/use-session";
import { supabase } from "@/integrations/supabase/client";

const LINKS: { label: string; to: string; params?: { category: string } }[] = [
  { label: "New In", to: "/shop" },
  { label: "Dresses", to: "/shop/$category", params: { category: "dresses" } },
  { label: "Outerwear", to: "/shop/$category", params: { category: "outerwear" } },
  { label: "Bags", to: "/shop/$category", params: { category: "bags" } },
  { label: "Jewellery", to: "/shop/$category", params: { category: "jewellery" } },
  { label: "Merchants", to: "/merchants" },
];

export function Nav({ overlay = false }: { overlay?: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsAdmin(Boolean(data));
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 240 && y > last);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = overlay && !solid;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent"} ${
          light ? "text-ivory" : ""
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="-ml-1 p-1 transition-opacity duration-200 hover:opacity-60 lg:hidden"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="display text-[1.6rem] tracking-[0.02em] md:text-[1.9rem]">
            DesignerSale
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  params={l.params as never}
                  className={`link-underline text-[0.7rem] uppercase tracking-[0.18em] transition-colors duration-200 ${
                    light ? "text-ivory/70 hover:text-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                  activeProps={{ className: light ? "text-ivory" : "text-foreground" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <button aria-label="Search" className="transition-opacity duration-200 hover:opacity-60">
              <SearchIcon />
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className={`hidden text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-200 sm:block ${
                  light ? "text-ivory/70 hover:text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              to={user ? "/orders" : "/auth"}
              className={`hidden text-[0.62rem] uppercase tracking-[0.18em] transition-colors duration-200 sm:block ${
                light ? "text-ivory/70 hover:text-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {user ? "Account" : "Login"}
            </Link>
            <button aria-label="Wishlist" className="hidden transition-opacity duration-200 hover:opacity-60 sm:block">
              <HeartIcon />
            </button>
            <Link to="/cart" aria-label="Shopping bag" className="relative transition-opacity duration-200 hover:opacity-60">
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[0.5rem] text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-olive-deep/30 backdrop-blur-sm transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[86%] max-w-sm bg-background px-7 py-8 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="display text-2xl">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          <ul className="mt-12 space-y-6">
            {LINKS.map((l, i) => (
              <li
                key={l.label}
                style={{ transitionDelay: `${120 + i * 45}ms` }}
                className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <Link
                  to={l.to}
                  params={l.params as never}
                  onClick={() => setOpen(false)}
                  className="display text-4xl"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow absolute bottom-10">Sydney · Melbourne · Perth</p>
          <div className="mt-12 flex gap-6 text-[0.62rem] uppercase tracking-[0.2em]">
            <Link to="/cart" onClick={() => setOpen(false)} className="link-underline">
              Bag ({count})
            </Link>
            <Link to={user ? "/orders" : "/auth"} onClick={() => setOpen(false)} className="link-underline">
              {user ? "Account" : "Login"}
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="link-underline">
                Admin
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SearchIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from "./Icons";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/use-session";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery } from "@/lib/catalog-queries";
import { getUserWishlist, removeFromWishlist } from "@/lib/wishlist.functions";

const LINKS: { label: string; to: string; params?: Record<string, string>; hash?: string }[] = [
  { label: "Women", to: "/shop/$category", params: { category: "dresses" } },
  { label: "Men", to: "/shop/$category", params: { category: "outerwear" } },
  { label: "Shoes", to: "/shop/$category", params: { category: "outerwear" } },
  { label: "Bags", to: "/shop/$category", params: { category: "bags" } },
  { label: "Accessories", to: "/shop/$category", params: { category: "bags" } },
  { label: "Jewellery", to: "/shop/$category", params: { category: "jewellery" } },
  { label: "Sale", to: "/shop/$category", params: { category: "dresses" } },
  { label: "New Arrivals", to: "/shop/$category", params: { category: "dresses" } },
  { label: "Under $200", to: "/shop/$category", params: { category: "dresses" } },
  { label: "Luxury Under $500", to: "/shop/$category", params: { category: "outerwear" } },
  { label: "Designer Spotlight", to: "/", hash: "designers" },
  { label: "Boutiques", to: "/merchants" },
];

function AnnouncementBar() {
  const announcements = [
    "WINTER CLEARANCE • UP TO 70% OFF",
    "FREE SHIPPING OVER $200",
    "NEW DESIGNER ARRIVALS THIS WEEK",
    "FINAL REDUCTIONS • LIMITED STOCK",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(t);
  }, [announcements.length]);

  return (
    <div className="w-full bg-burgundy text-champagne py-2.5 px-4 text-[0.6rem] tracking-[0.26em] font-semibold uppercase text-center transition-all duration-500 overflow-hidden h-9 flex items-center justify-center">
      <div key={index} className="animate-[fade-in_0.5s_ease-out] w-full font-medium">
        {announcements[index]}
      </div>
    </div>
  );
}

export function Nav({ overlay = false }: { overlay?: boolean }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { count } = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  const getWishlistFn = useServerFn(getUserWishlist);
  const removeWishlistFn = useServerFn(removeFromWishlist);

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: () => getWishlistFn({}),
    enabled: Boolean(user),
  });

  const { data: catalogItems = [] } = useQuery({
    ...catalogQuery,
    enabled: searchOpen,
  });

  const removeWishlistMut = useMutation({
    mutationFn: (itemId: string) => removeWishlistFn({ data: { itemId } }),
    onSuccess: () => {
      toast.success("Item removed from wishlist");
      qc.invalidateQueries({ queryKey: ["user-wishlist"] });
    },
  });

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
    const onScroll = () => {
      const y = window.scrollY;
      const isPastTop = y > 60;
      setSolid(isPastTop);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = overlay && !solid;
  const showExtra = overlay && !solid;

  const filteredSearchResults = searchQuery.trim()
    ? catalogItems
        .filter(
          (item: any) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const handleWishlistClick = () => {
    if (!user) {
      toast.info("Please sign in to save pieces to your wishlist", {
        action: {
          label: "Sign in",
          onClick: () => navigate({ to: "/auth" }),
        },
      });
      return;
    }
    setWishlistOpen(true);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex flex-col items-center">
        {/* Announcement Bar */}
        <div
          className={`w-full transition-[height,opacity] duration-500 ease-luxe overflow-hidden ${
            showExtra ? "h-9 opacity-100" : "h-0 opacity-0"
          }`}
        >
          <AnnouncementBar />
        </div>

        {/* Full Header */}
        <header
          className={`w-full transition-all duration-500 ease-luxe border-b ${
            solid
              ? "border-border bg-background/95 backdrop-blur-xl text-foreground shadow-sm"
              : "border-transparent bg-transparent " + (light ? "text-ivory" : "text-foreground")
          }`}
        >
          <div className="relative mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 md:h-16 md:px-10">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="-ml-1 p-2 transition-opacity duration-200 hover:opacity-60 lg:hidden cursor-pointer"
            >
              <MenuIcon />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="display text-[1.4rem] tracking-[0.02em] md:text-[1.7rem] hover:opacity-90 transition-opacity"
            >
              DesignerSale
            </Link>

            {/* Center Navigation Links (desktop only) */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {[
                { label: "Home", to: "/" },
                { label: "Sales", to: "/shop" },
                { label: "About", to: "/about" },
                { label: "Contacts", to: "/contacts" },
                { label: "FAQs", to: "/faqs" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  className={`text-[0.68rem] font-bold uppercase tracking-[0.22em] transition-all duration-300 ${
                    light && !solid
                      ? "text-ivory/80 hover:text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  activeProps={{
                    className:
                      light && !solid
                        ? "!text-ivory font-extrabold"
                        : "!text-foreground font-extrabold",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4.5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="transition-opacity duration-200 hover:opacity-60 cursor-pointer"
              >
                <SearchIcon />
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hidden text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 sm:block ${
                    light && !solid
                      ? "text-ivory/70 hover:text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
              {user ? (
                <Link
                  to="/profile"
                  className={`hidden text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 sm:block ${
                    light && !solid
                      ? "text-ivory/70 hover:text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Profile
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className={`hidden text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 sm:block ${
                    light && !solid
                      ? "text-ivory/70 hover:text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Login
                </Link>
              )}
              <button
                onClick={handleWishlistClick}
                aria-label="Wishlist"
                className="hidden transition-opacity duration-200 hover:opacity-60 sm:block cursor-pointer"
              >
                <HeartIcon />
              </button>
              <Link
                to="/cart"
                aria-label="Shopping bag"
                className="relative transition-opacity duration-200 hover:opacity-60"
              >
                <BagIcon />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[0.55rem] font-bold text-ivory">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Sub Navigation Bar (E-commerce Categories) */}
          <div
            className={`hidden lg:block border-t border-border/20 transition-[max-height,opacity,border-color] duration-500 ease-luxe overflow-hidden ${
              showExtra
                ? "max-h-20 opacity-100"
                : "max-h-0 opacity-0 pointer-events-none border-t-transparent"
            }`}
          >
            <div className="mx-auto max-w-[1600px] px-5 py-2.5">
              <ul className="flex items-center justify-center gap-7 flex-wrap">
                {LINKS.map((l) => (
                  <li key={l.label}>
                    {l.hash ? (
                      <a
                        href={`/${l.hash ? "#" + l.hash : ""}`}
                        className={`text-[0.62rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                          l.label === "Sale"
                            ? light
                              ? "text-gold hover:text-gold/80 font-bold animate-[pulse_3s_infinite]"
                              : "text-burgundy hover:text-burgundy/80 font-bold"
                            : light
                              ? "text-ivory/85 hover:text-gold"
                              : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to}
                        params={l.params as never}
                        className={`text-[0.62rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                          l.label === "Sale"
                            ? light
                              ? "text-gold hover:text-gold/80 font-bold animate-[pulse_3s_infinite]"
                              : "text-burgundy hover:text-burgundy/80 font-bold"
                            : light
                              ? "text-ivory/85 hover:text-gold"
                              : "text-muted-foreground hover:text-foreground"
                        }`}
                        activeProps={{ className: light ? "text-ivory" : "text-foreground" }}
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>
      </div>

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3 flex-1">
                <SearchIcon />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search piece, designer, or category..."
                  className="w-full bg-transparent text-base font-serif outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-1 hover:opacity-60 cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="py-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
                  Type to search the DesignerSale edit
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No matching pieces found for "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredSearchResults.map((item: any) => (
                    <Link
                      key={item.id}
                      to="/product/$id"
                      params={{ id: item.id }}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-4 py-3 hover:bg-cream/60 px-2 transition-colors group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-11 object-cover bg-cream shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-gold truncate">
                          {item.designer}
                        </p>
                        <p className="font-serif text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.condition} · {item.size}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-serif font-bold text-foreground">{item.price}</p>
                        {item.was && (
                          <p className="text-xs text-muted-foreground line-through">{item.was}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Drawer */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div
            onClick={() => setWishlistOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-[fade-in_0.3s_ease-out]"
          />
          <aside className="relative w-full max-w-md bg-background h-full shadow-2xl p-6 flex flex-col justify-between overflow-hidden animate-[slide-left_0.3s_ease-out]">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="display text-xl">Saved Wishlist ({wishlistItems.length})</span>
                <button onClick={() => setWishlistOpen(false)} className="cursor-pointer">
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-6 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {wishlistItems.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Your wishlist is empty. Explore the catalog and tap the heart icon on any piece
                    to save it.
                  </p>
                ) : (
                  wishlistItems.map((wi: any) => {
                    const prod = wi.products;
                    if (!prod) return null;
                    const options = (prod.options as any[]) ?? [];
                    const defaultColor = options.find((o: any) => o.isDefault) ?? options[0];
                    const image =
                      defaultColor?.images?.find((img: any) => img.isPrimary)?.url ??
                      defaultColor?.images?.[0]?.url ??
                      "";
                    const brand = prod.brands?.name ?? "DesignerSale";
                    return (
                      <div
                        key={wi.id}
                        className="flex gap-4 border-b border-border/50 pb-4 items-center"
                      >
                        <img
                          src={image}
                          alt={prod.name}
                          className="h-16 w-12 object-cover bg-cream shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-gold">
                            {brand}
                          </p>
                          <Link
                            to="/product/$id"
                            params={{ id: prod.slug }}
                            onClick={() => setWishlistOpen(false)}
                            className="font-serif text-sm font-medium hover:underline text-foreground truncate block"
                          >
                            {prod.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeWishlistMut.mutate(wi.id)}
                          className="text-xs text-destructive hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Link
                to="/shop"
                onClick={() => setWishlistOpen(false)}
                className="block w-full bg-olive-deep py-3 text-center text-[0.62rem] font-bold uppercase tracking-[0.24em] text-ivory hover:opacity-90 transition-opacity"
              >
                Browse All Pieces
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[86%] max-w-sm bg-background px-7 py-8 transition-transform duration-500 ease-luxe flex flex-col justify-between ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <span className="display text-xl">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Primary Page Links */}
            <ul className="mt-8 space-y-4 border-b border-border/40 pb-6 pr-2">
              {[
                { label: "Home", to: "/" },
                { label: "Sales", to: "/shop" },
                { label: "About", to: "/about" },
                { label: "Contacts", to: "/contacts" },
                { label: "FAQs", to: "/faqs" },
              ].map((link, i) => (
                <li
                  key={link.label}
                  style={{ transitionDelay: `${80 + i * 30}ms` }}
                  className={`transition-all duration-500 ease-luxe ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                >
                  <Link
                    to={link.to}
                    activeOptions={{ exact: link.to === "/" }}
                    onClick={() => setOpen(false)}
                    className="display text-2xl hover:text-gold transition-colors text-foreground"
                    activeProps={{ className: "!text-gold font-bold" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Shop Categories */}
            <div className="mt-6">
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Shop Categories
              </span>
              <ul className="mt-4 space-y-3 overflow-y-auto max-h-[30vh] pr-2">
                {LINKS.map((l, i) => (
                  <li
                    key={l.label}
                    style={{ transitionDelay: `${250 + i * 25}ms` }}
                    className={`transition-all duration-500 ease-luxe ${
                      open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                  >
                    {l.hash ? (
                      <a
                        href={`/${l.hash ? "#" + l.hash : ""}`}
                        onClick={() => setOpen(false)}
                        className={`text-sm uppercase tracking-widest hover:text-gold transition-colors ${
                          l.label === "Sale" ? "text-burgundy font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to}
                        params={l.params as never}
                        onClick={() => setOpen(false)}
                        className={`text-sm uppercase tracking-widest hover:text-gold transition-colors ${
                          l.label === "Sale" ? "text-burgundy font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6">
            <p className="eyebrow text-[0.6rem] mb-4">Sydney · Melbourne · Hobart · Perth</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[0.6rem] uppercase tracking-[0.2em] font-semibold">
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="link-underline text-foreground"
              >
                Bag ({count})
              </Link>
              <Link
                to={user ? "/profile" : "/auth"}
                onClick={() => setOpen(false)}
                className="link-underline text-foreground"
              >
                {user ? "Profile" : "Login"}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="link-underline text-foreground"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Spacing element to prevent layout overlap */}
      {!overlay && <div className="h-14 lg:h-16" />}
    </>
  );
}

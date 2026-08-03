import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Bell,
  Boxes,
  ChevronDown,
  FileText,
  Folder,
  Grid,
  PanelsTopLeft,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Send,
  ShoppingBag,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const SECTIONS: { heading: string; items: Item[] }[] = [
  {
    heading: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    heading: "Catalogue",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
      { to: "/admin/brands", label: "Brands", icon: Award },
      { to: "/admin/categories", label: "Categories", icon: Folder },
      { to: "/admin/product-types", label: "Product Types", icon: Grid },
      { to: "/admin/merchants", label: "Merchants", icon: Store },
    ],
  },
  {
    heading: "Merchandising",
    items: [
      { to: "/admin/banners", label: "Banners", icon: Image },
      { to: "/admin/sales", label: "Sales", icon: Tag },
      { to: "/admin/curated-pages", label: "Curated Pages", icon: PanelsTopLeft },
    ],
  },
  {
    heading: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { to: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    heading: "Content",
    items: [
      { to: "/admin/blog", label: "Blog Posts", icon: FileText },
      { to: "/admin/contact-inquiries", label: "Contact Enquiries", icon: Mail },
      { to: "/admin/newsletter", label: "Newsletter Subscribers", icon: Send },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-6 px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <p className="px-3 pb-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            {section.heading}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[16rem] flex-col border-r border-border bg-card lg:flex">
        <Link to="/admin" className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">DesignerSale</span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <div className="border-t border-border px-4 py-3 text-[0.68rem] text-muted-foreground">
          Admin console
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[17rem] overflow-y-auto bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                DesignerSale
              </span>
              <button onClick={() => setDrawer(false)} aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="lg:ml-[16rem]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <button
            className="lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <label className="relative hidden max-w-sm flex-1 items-center sm:flex">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Search orders</span>
            <input
              placeholder="Search orders by reference or customer…"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value.trim();
                  navigate({ to: "/admin/orders", search: { search: value || undefined } as any });
                }
              }}
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="relative rounded-md p-2 hover:bg-muted"
              aria-label="Notifications"
              onClick={() =>
                navigate({ to: "/admin/orders", search: { status: "confirmed" } as any })
              }
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[0.6rem] text-background">
                  {(email ?? "A").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[12rem] truncate sm:inline">
                  {email ?? "Administrator"}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-border bg-card shadow-lg">
                  <p className="truncate border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    {email ?? "Administrator"}
                  </p>
                  <Link
                    to="/"
                    className="block px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMenu(false)}
                  >
                    View storefront
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}

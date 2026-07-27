import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { Nav } from "@/components/Nav";
import { getMyAdminAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/merchants", label: "Merchants" },
  { to: "/admin/users", label: "Users & roles" },
] as const;

function AdminLayout() {
  const check = useServerFn(getMyAdminAccess);
  const { data, isPending } = useQuery({ queryKey: ["admin-access"], queryFn: () => check({}) });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[70vh] max-w-[1500px] px-5 pb-28 pt-32 md:px-10 md:pt-36">
        <p className="rule-label text-muted-foreground">Administration</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.4rem)] leading-[1]">Control room</h1>

        {isPending && <p className="mt-14 text-sm text-muted-foreground">Checking your access…</p>}

        {!isPending && !data?.isAdmin && (
          <div className="mt-14 border-t border-border pt-14">
            <p className="text-sm text-muted-foreground">
              This area is reserved for administrators. If you believe this is a mistake, contact the
              store owner.
            </p>
            <Link
              to="/"
              className="mt-8 inline-block bg-olive-deep px-10 py-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory"
            >
              Back to the store
            </Link>
          </div>
        )}

        {data?.isAdmin && (
          <>
            <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-4">
              {TABS.map((t) => {
                const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`text-[0.66rem] uppercase tracking-[0.2em] transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-10">
              <Outlet />
            </div>
          </>
        )}
      </main>
    </>
  );
}

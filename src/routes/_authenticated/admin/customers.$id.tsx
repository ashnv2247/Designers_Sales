import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  Heart,
} from "lucide-react";

import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import { adminGetCustomerDetail, adminUpdateCustomerStatus } from "@/lib/admin-content.functions";
import { formatDateTime } from "@/lib/admin-metrics";
import { money } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  head: () => ({
    meta: [
      { title: "Customer Profile | DesignerSale Admin" },
      {
        name: "description",
        content: "Detailed customer profile, addresses, orders, cart, and wishlist.",
      },
    ],
  }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const getDetail = useServerFn(adminGetCustomerDetail);
  const updateStatus = useServerFn(adminUpdateCustomerStatus);
  const qc = useQueryClient();

  const {
    data: customer,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-customer-detail", id],
    queryFn: () => getDetail({ data: { id } }),
  });

  const statusMut = useMutation({
    mutationFn: (status: "active" | "suspended" | "deleted") =>
      updateStatus({ data: { id, status } }),
    onSuccess: () => {
      toast.success("Customer status updated");
      qc.invalidateQueries({ queryKey: ["admin-customer-detail", id] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update customer status"),
  });

  if (isPending)
    return <p className="text-sm text-muted-foreground">Loading customer details...</p>;
  if (error || !customer)
    return <p className="text-sm text-destructive">Failed to load customer details.</p>;

  const { profile, addresses, orders, cart, wishlist } = customer;

  const totalSpend = orders
    .filter((o: any) => o.status !== "cancelled")
    .reduce((sum: number, o: any) => sum + (o.total_cents ?? 0), 0);

  return (
    <>
      <Link
        to="/admin/customers"
        className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>

      <PageHeader
        title={
          profile.display_name ||
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
          "Customer Profile"
        }
        description={`Registered ${formatDateTime(profile.created_at)}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={profile.status} />
            {profile.status === "active" && (
              <button
                onClick={() => {
                  if (confirm("Suspend this customer account?")) statusMut.mutate("suspended");
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Suspend
              </button>
            )}
            {profile.status === "suspended" && (
              <button
                onClick={() => {
                  if (confirm("Reactivate this customer account?")) statusMut.mutate("active");
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Reactivate
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card & Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Saved Addresses */}
          <Card title="Saved Addresses">
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">No saved addresses.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((addr: any) => (
                  <div
                    key={addr.id}
                    className="border border-border rounded-md p-3.5 bg-muted/10 relative"
                  >
                    {addr.is_default && (
                      <span className="absolute right-3 top-3 text-[10px] uppercase font-bold tracking-wider bg-gold/10 border border-gold/20 px-2 py-0.5 rounded text-gold">
                        Default
                      </span>
                    )}
                    <p className="font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {addr.label || "Address"}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{addr.full_name}</p>
                      <p>{addr.address_line_1}</p>
                      {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                      <p>
                        {addr.city}, {addr.state || ""} {addr.postal_code}
                      </p>
                      <p className="uppercase font-semibold text-[10px] tracking-wider">
                        {addr.country}
                      </p>
                      {addr.phone && (
                        <p className="mt-1 pt-1 border-t border-border/40 text-foreground">
                          Phone: {addr.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Orders History */}
          <Card title={`Order History (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                No order history available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/20">
                    <tr>
                      <th className="px-4 py-2">Ref</th>
                      <th className="px-4 py-2">Items</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-medium">
                          <Link
                            to="/admin/orders/$id"
                            params={{ id: o.id }}
                            className="text-teal-700 hover:underline"
                          >
                            {o.reference}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">{(o.order_items ?? []).length} items</td>
                        <td className="px-4 py-2.5">{money(o.total_cents)}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel: Spend, Cart, Wishlist */}
        <div className="space-y-6">
          {/* Summary stats */}
          <Card title="Customer Summary">
            <dl className="space-y-3.5 text-sm">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd
                  className="font-medium truncate max-w-[170px]"
                  title={profile.email ?? undefined}
                >
                  {profile.email}
                </dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium">{profile.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Total Spend</dt>
                <dd className="font-semibold text-emerald-700">{money(totalSpend)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Orders</dt>
                <dd className="font-medium">{orders.length} orders</dd>
              </div>
            </dl>
          </Card>

          {/* Active Cart */}
          <Card title="Active Cart">
            {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <ShoppingCart className="h-5 w-5 mb-1.5" />
                <p className="text-xs">No active cart or empty cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground flex justify-between border-b border-border/40 pb-1.5">
                  <span>
                    Cart Status:{" "}
                    <span className="capitalize font-medium text-foreground">{cart.status}</span>
                  </span>
                  <span>Updated: {new Date(cart.updated_at).toLocaleDateString()}</span>
                </div>
                <ul className="divide-y divide-border/40 max-h-56 overflow-y-auto">
                  {cart.cart_items.map((item: any) => (
                    <li
                      key={item.id}
                      className="py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-grow">
                        <p className="font-medium truncate">
                          {item.product_variants?.products?.name || "Product"}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          Size {item.product_variants?.size || "OS"} · Color{" "}
                          {item.product_variants?.color_name || "Default"}
                        </p>
                      </div>
                      <span className="shrink-0 text-muted-foreground">Qty {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Wishlist summary */}
          <Card title="Wishlist">
            {!wishlist || !wishlist.wishlist_items || wishlist.wishlist_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Heart className="h-5 w-5 mb-1.5" />
                <p className="text-xs">Wishlist is empty</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 max-h-56 overflow-y-auto">
                {wishlist.wishlist_items.map((item: any) => (
                  <li
                    key={item.id}
                    className="py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-medium truncate flex-grow">
                      {item.products?.name || "Product"}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

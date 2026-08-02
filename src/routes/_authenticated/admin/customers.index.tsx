import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Eye, ShieldAlert, CheckCircle, Trash2 } from "lucide-react";

import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import { adminListCustomers, adminUpdateCustomerStatus } from "@/lib/admin-content.functions";
import { formatDate } from "@/lib/admin-metrics";
import { money } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  head: () => ({
    meta: [
      { title: "Customers | DesignerSale Admin" },
      { name: "description", content: "Manage and audit customer profiles and metrics." },
    ],
  }),
  component: CustomersList,
});

function CustomersList() {
  const list = useServerFn(adminListCustomers);
  const updateStatus = useServerFn(adminUpdateCustomerStatus);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("");

  const {
    data: customers,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-customers", search, statusFilter],
    queryFn: () => list({ data: { search, status: statusFilter || undefined } }),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "active" | "suspended" | "deleted" }) =>
      updateStatus({ data: v }),
    onSuccess: () => {
      toast.success("Customer status updated successfully");
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update customer status"),
  });

  const listData = customers ?? [];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Monitor user profile registrations, verify metrics, and handle suspensions."
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search customers"
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none"
            aria-label="Filter by Status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading customers list...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load customers list.</p>
      ) : listData.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">No customers found.</p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Joined Date</th>
                  <th className="px-6 py-3">Last Seen</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Total Spend</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listData.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium">
                          {c.display_name ||
                            `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() ||
                            "Unnamed User"}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.last_login_at ? formatDate(c.last_login_at) : "—"}
                    </td>
                    <td className="px-6 py-3">{c.orderCount} orders</td>
                    <td className="px-6 py-3 font-medium">{money(c.totalSpend)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/admin/customers/$id"
                          params={{ id: c.id }}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="View customer profile"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Link>
                        {c.status === "active" ? (
                          <button
                            onClick={() => {
                              if (confirm(`Suspend customer ${c.email}?`)) {
                                statusMut.mutate({ id: c.id, status: "suspended" });
                              }
                            }}
                            className="rounded border border-border p-1.5 hover:bg-muted"
                            title="Suspend customer"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                          </button>
                        ) : c.status === "suspended" ? (
                          <button
                            onClick={() => {
                              if (confirm(`Reactivate customer ${c.email}?`)) {
                                statusMut.mutate({ id: c.id, status: "active" });
                              }
                            }}
                            className="rounded border border-border p-1.5 hover:bg-muted"
                            title="Reactivate customer"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                          </button>
                        ) : null}
                        {c.status !== "deleted" && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete customer ${c.email} permanently? This will fail if they have orders.`,
                                )
                              ) {
                                statusMut.mutate({ id: c.id, status: "deleted" });
                              }
                            }}
                            className="rounded border border-border p-1.5 hover:bg-muted text-destructive"
                            title="Delete customer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

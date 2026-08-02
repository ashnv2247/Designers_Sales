import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Download, Trash2, Mail, CheckCircle, XCircle } from "lucide-react";

import { Btn } from "@/components/admin/ui";
import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import {
  adminDeleteNewsletterSubscriber,
  adminListNewsletterSubscribers,
  adminUpdateNewsletterSubscriberStatus,
} from "@/lib/admin-content.functions";
import { downloadCsv, formatDate, friendlyError } from "@/lib/admin-metrics";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter Subscribers | DesignerSale Admin" },
      { name: "description", content: "Manage, audit, and export newsletter subscription list." },
    ],
  }),
  component: AdminNewsletter,
});

function AdminNewsletter() {
  const list = useServerFn(adminListNewsletterSubscribers);
  const updateStatus = useServerFn(adminUpdateNewsletterSubscriberStatus);
  const remove = useServerFn(adminDeleteNewsletterSubscriber);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("");

  const {
    data: subscribers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["admin-newsletter", search, statusFilter],
    queryFn: () => list({ data: { search, status: statusFilter || undefined } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "subscribed" | "unsubscribed" }) =>
      updateStatus({ data: v }),
    onSuccess: () => {
      toast.success("Subscriber status updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update subscriber status"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Subscriber deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete subscriber"),
  });

  const handleExport = () => {
    const listData = subscribers ?? [];
    if (listData.length === 0) return toast.error("No subscribers to export");
    downloadCsv(
      `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
      listData.map((s: any) => ({
        Email: s.email,
        Status: s.status,
        Joined: formatDate(s.created_at),
      })),
    );
    toast.success(`Exported ${listData.length} subscribers`);
  };

  const listData = subscribers ?? [];

  return (
    <>
      <PageHeader
        title="Newsletter Subscribers"
        description="View marketing email subscriptions, edit subscription status, or export for campaigns."
        actions={
          <Btn onClick={handleExport} disabled={listData.length === 0}>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </span>
          </Btn>
        }
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subscriber email..."
            aria-label="Search subscribers"
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
            <option value="">All Subscribers</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading subscribers...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load newsletter subscribers.</p>
      ) : listData.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">No subscribers found.</p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Joined Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listData.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === "subscribed" ? (
                          <button
                            onClick={() => statusMut.mutate({ id: s.id, status: "unsubscribed" })}
                            className="rounded border border-border p-1.5 hover:bg-muted"
                            title="Unsubscribe user"
                          >
                            <XCircle className="h-3.5 w-3.5 text-amber-700" />
                          </button>
                        ) : (
                          <button
                            onClick={() => statusMut.mutate({ id: s.id, status: "subscribed" })}
                            className="rounded border border-border p-1.5 hover:bg-muted"
                            title="Resubscribe user"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete subscriber email ${s.email}?`)) {
                              deleteMut.mutate(s.id);
                            }
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted text-destructive"
                          title="Delete subscriber record"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
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

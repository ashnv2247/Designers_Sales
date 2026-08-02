import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Mail, Eye, Trash2, CheckCircle, ShieldAlert, AlertTriangle } from "lucide-react";

import { Card, PageHeader, StatusBadge } from "@/components/admin/kit";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  adminDeleteInquiry,
  adminListInquiries,
  adminUpdateInquiryStatus,
} from "@/lib/admin-content.functions";
import { formatDateTime } from "@/lib/admin-metrics";

export const Route = createFileRoute("/_authenticated/admin/contact-inquiries")({
  head: () => ({
    meta: [
      { title: "Contact Inquiries | DesignerSale Admin" },
      { name: "description", content: "View and respond to client storefront contact messages." },
    ],
  }),
  component: AdminInquiries,
});

function AdminInquiries() {
  const list = useServerFn(adminListInquiries);
  const updateStatus = useServerFn(adminUpdateInquiryStatus);
  const remove = useServerFn(adminDeleteInquiry);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const {
    data: inquiries,
    isPending,
    error,
  } = useQuery({
    queryKey: ["admin-inquiries", search, statusFilter],
    queryFn: () => list({ data: { search, status: statusFilter || undefined } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "unread" | "read" | "resolved" | "spam" }) =>
      updateStatus({ data: v }),
    onSuccess: (_, variables) => {
      toast.success(`Inquiry marked as ${variables.status}`);
      invalidate();
      if (selectedInquiry && selectedInquiry.id === variables.id) {
        setSelectedInquiry((prev: any) => (prev ? { ...prev, status: variables.status } : null));
      }
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update inquiry status"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Inquiry deleted");
      setSelectedInquiry(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete inquiry"),
  });

  const listData = inquiries ?? [];

  return (
    <>
      <PageHeader
        title="Contact Enquiries"
        description="Review customer inquiries, filter out spam, and track resolutions."
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sender, email, message..."
            aria-label="Search inquiries"
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
            <option value="">All Inquiries</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <AdminModal
        open={Boolean(selectedInquiry)}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiry(null);
        }}
        title={selectedInquiry?.subject ?? "Inquiry Details"}
        description={`From ${selectedInquiry?.name} (${selectedInquiry?.email})`}
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground">
              <span>Date: {formatDateTime(selectedInquiry.created_at)}</span>
              <StatusBadge status={selectedInquiry.status} />
            </div>

            <div className="rounded-md border bg-muted/10 p-4 text-sm text-foreground whitespace-pre-wrap font-sans">
              {selectedInquiry.message}
            </div>

            <div className="flex flex-wrap gap-2.5 justify-between items-center pt-4 border-t border-border mt-4">
              <div className="flex gap-2">
                {selectedInquiry.status !== "resolved" && (
                  <button
                    onClick={() => statusMut.mutate({ id: selectedInquiry.id, status: "resolved" })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Resolve
                  </button>
                )}
                {selectedInquiry.status !== "spam" && (
                  <button
                    onClick={() => statusMut.mutate({ id: selectedInquiry.id, status: "spam" })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> Mark Spam
                  </button>
                )}
                {selectedInquiry.status === "unread" && (
                  <button
                    onClick={() => statusMut.mutate({ id: selectedInquiry.id, status: "read" })}
                    className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    Mark Read
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this inquiry permanently?"))
                    deleteMut.mutate(selectedInquiry.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading enquiries...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load contact enquiries.</p>
      ) : listData.length === 0 ? (
        <Card
          children={
            <p className="text-sm text-muted-foreground py-6 text-center">
              No contact enquiries found.
            </p>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Message Preview</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listData.map((i: any) => (
                  <tr
                    key={i.id}
                    className={`hover:bg-muted/30 ${i.status === "unread" ? "font-semibold bg-blue-50/10" : ""}`}
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p>{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3">{i.subject}</td>
                    <td className="px-6 py-3 max-w-xs truncate text-muted-foreground font-light">
                      {i.message}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">
                      {formatDateTime(i.created_at)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (i.status === "unread") {
                              statusMut.mutate({ id: i.id, status: "read" });
                            }
                            setSelectedInquiry(i);
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted"
                          title="View inquiry details"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        {i.status !== "resolved" && (
                          <button
                            onClick={() => statusMut.mutate({ id: i.id, status: "resolved" })}
                            className="rounded border border-border p-1.5 hover:bg-muted"
                            title="Mark resolved"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete inquiry from ${i.email}?`)) {
                              deleteMut.mutate(i.id);
                            }
                          }}
                          className="rounded border border-border p-1.5 hover:bg-muted text-destructive"
                          title="Delete inquiry"
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

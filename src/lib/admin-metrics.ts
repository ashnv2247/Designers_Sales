/** Shared, client-safe admin helpers: the single source of truth for revenue,
 *  status presentation, date ranges and CSV formatting. */

export const LOW_STOCK_THRESHOLD = 5;

/** Business rule: revenue counts every order that has not been cancelled. */
export function isRevenueOrder(status: string) {
  return status !== "cancelled";
}

export function revenueCentsOf(orders: { status: string; total_cents: number | null }[]) {
  return orders.reduce((n, o) => (isRevenueOrder(o.status) ? n + (o.total_cents ?? 0) : n), 0);
}

export type RangeKey = "today" | "7d" | "30d" | "90d" | "all" | "custom";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export function resolveRange(key: RangeKey, from?: string, to?: string) {
  if (key === "custom" && from && to) {
    return { from: new Date(`${from}T00:00:00`).toISOString(), to: new Date(`${to}T23:59:59`).toISOString() };
  }
  const now = new Date();
  const end = now.toISOString();
  if (key === "all") return { from: null, to: end };
  const days = key === "today" ? 0 : key === "7d" ? 6 : key === "30d" ? 29 : 89;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return { from: start.toISOString(), to: end };
}

/** Tone mapping used by every status badge in the panel. */
export type Tone = "green" | "amber" | "blue" | "red" | "grey";

const TONES: Record<string, Tone> = {
  delivered: "green",
  published: "green",
  approved: "green",
  active: "green",
  available: "green",
  pending: "amber",
  preparing: "amber",
  draft: "amber",
  low_stock: "amber",
  confirmed: "blue",
  in_transit: "blue",
  scheduled: "blue",
  cancelled: "red",
  rejected: "red",
  suspended: "red",
  out_of_stock: "red",
  archived: "grey",
  inactive: "grey",
  sold_out: "grey",
  deleted: "grey",
};

export function toneFor(status: string): Tone {
  return TONES[status] ?? "grey";
}

export const TONE_CLASS: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  red: "bg-red-50 text-red-700 border-red-200",
  grey: "bg-muted text-muted-foreground border-border",
};

export function humanStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Builds and downloads a CSV file in the browser. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Maps raw backend errors to language a non-technical administrator understands. */
export function friendlyError(message: string) {
  if (/duplicate key.*slug/i.test(message)) return "A record with this slug already exists.";
  if (/duplicate key.*sku/i.test(message)) return "This SKU is already in use.";
  if (/foreign key/i.test(message)) return "This record is still referenced elsewhere and cannot be deleted.";
  if (/forbidden|row-level security|permission/i.test(message))
    return "You do not have permission to perform this action.";
  if (/jwt|session|unauthor/i.test(message)) return "The session has expired. Please sign in again.";
  return "Something went wrong. Please try again.";
}

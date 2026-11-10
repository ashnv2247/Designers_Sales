import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard Console — DESIGNERSALE (DS/)",
  description: "Normal sidebar administration panel for managing directory boutiques, city guides, journal articles, and media.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient initialView="dashboard" />;
}

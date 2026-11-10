import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Studio & Dynamic CMS — DESIGNERSALE (DS/)",
  description: "Manage boutiques, dynamic products catalog, Supabase database, and Cloudinary media assets.",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}


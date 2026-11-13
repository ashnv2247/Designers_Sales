import React, { Suspense } from "react";
import LoginClient from "@/components/auth/LoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curator Access & Login | DesignerSale Australia",
  description: "Curatorial and administrative access to the DesignerSale in-place studio and directory management system.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center font-editorial-sans text-xs tracking-widest uppercase text-stone-500">Loading Portal...</div>}>
      <LoginClient />
    </Suspense>
  );
}


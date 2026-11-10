import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DESIGNERSALE — The Visual Discovery Directory",
  description:
    "A curated directory of Australia's best designer shops, independent boutiques and local stores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased selection:bg-surface-warm selection:text-foreground">
        {children}
      </body>
    </html>
  );
}

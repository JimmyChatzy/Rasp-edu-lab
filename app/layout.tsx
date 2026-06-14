import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raspberry Pi Εκπαίδευση",
  description:
    "Διδακτικά σενάρια Raspberry Pi για εκπαιδευτικούς δημοτικού σχολείου",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
        <Navbar />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Πλατφόρμα εκπαιδευτικών σεναρίων Raspberry Pi — Δημοτικό Σχολείο
        </footer>
      </body>
    </html>
  );
}

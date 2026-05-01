// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Menginisialisasi font Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ala Collection - Payroll System",
  description: "Sistem Manajemen Penggajian Konveksi Ala Collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Menerapkan font inter dan antialiased agar huruf terlihat halus */}
      <body className={`${inter.className} antialiased bg-slate-50`}>
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
// app/dashboard/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/admin-navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Cek apakah sudah login
  if (!session) {
    redirect("/login");
  }

  // 2. Proteksi Role (Hanya Admin & Owner)
  // @ts-ignore
  const role = session.user?.role;
  if (role !== "admin" && role !== "owner") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center p-4">
        <h1 className="text-4xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="mt-2 text-slate-600">
          Maaf, halaman ini hanya dapat diakses oleh Admin atau Owner.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar ditempatkan di atas seluruh konten dashboard */}
      <AdminNavbar user={session.user} />

      {/* Area utama tempat halaman spesifik (page.tsx) akan di-render */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

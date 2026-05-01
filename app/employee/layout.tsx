// app/karyawan/layout.tsx
import BottomNav from "./bottom-nav";

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Background abu-abu terang agar kesan aplikasinya muncul
    <div className="min-h-screen bg-slate-50 flex justify-center">
      {/* Kontainer utama berukuran HP (Mobile First) */}
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl shadow-slate-200/50 flex flex-col">
        {/* Area Konten (Ada padding bawah agar tidak tertutup Tab Bar) */}
        <main className="flex-1 pb-20 overflow-y-auto">{children}</main>

        {/* Tab Bar Bawah */}
        <BottomNav />
      </div>
    </div>
  );
}

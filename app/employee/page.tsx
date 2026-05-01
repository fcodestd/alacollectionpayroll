// app/employee/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  History,
  BellRing,
  Download,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import "@/app/globals.css";

export default async function EmployeeHomePage() {
  const session = await auth();

  if (!session) redirect("/login");
  const roleLower = session.user?.role?.toLowerCase() || "";
  if (roleLower !== "karyawan" && roleLower !== "employee")
    redirect("/dashboard");

  const karyawan = {
    name: session.user?.name || "Karyawan",
    jenis: session.user?.employeeJenis || "Belum Ditentukan",
    id: session.user?.employeeId,
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* HEADER ELEGAN (Selaras dengan halaman Profil) */}
      <div className="bg-slate-900 rounded-b-[2.5rem] p-8 pt-12 text-white shadow-xl relative overflow-hidden">
        {/* Ornamen Cahaya Belakang */}
        <div className="absolute top-[-20%] left-[-10%] h-40 w-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-32 w-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
              Panel Karyawan
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
              Halo, {karyawan.name.split(" ")[0]}!
            </h1>
            <div className="flex items-center gap-2 mt-3 bg-slate-800/80 w-fit px-3 py-1.5 rounded-full border border-slate-700/50 shadow-sm">
              <Briefcase className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                {karyawan.jenis}
              </span>
            </div>
          </div>

          {/* Tombol Notifikasi Glassmorphism */}
          <button className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <BellRing className="h-5 w-5 text-white" />
            {/* Indikator Titik Merah (Opsional) */}
            
          </button>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="px-5 space-y-6 -mt-4 relative z-20">
        {/* ALERT JIKA BELUM DITAUTKAN */}
        {!karyawan.id && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-800 leading-relaxed">
              Akun Anda belum ditautkan ke data pegawai oleh Admin. Anda belum
              bisa melihat laporan kinerja.
            </p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 ml-1 uppercase tracking-wider">
            Aksi Utama
          </h2>

          <div className="space-y-4">
            {/* KARTU 1: HASIL PEKERJAAN */}
            <Link
              href={karyawan.id ? "/employee/kinerja" : "#"}
              className={
                karyawan.id ? "block" : "pointer-events-none opacity-50"
              }
            >
              <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:border-blue-100 transition-all active:scale-[0.98] group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Hasil Pekerjaan
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Cek rekap hasil kinerja Anda
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
            </Link>

            {/* KARTU 2: DOWNLOAD SLIP GAJI */}
            <Link
              href={karyawan.id ? "/employee/slip" : "#"}
              className={
                karyawan.id ? "block" : "pointer-events-none opacity-50"
              }
            >
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Download className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Download Slip Gaji
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 tracking-wide">
                      FORMAT PDF (MINGGU INI)
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

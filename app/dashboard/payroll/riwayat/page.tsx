import Link from "next/link";
import { Scissors, Shirt, FileSignature } from "lucide-react";

export default function RiwayatEntryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Riwayat Penggajian
        </h1>
        <p className="text-base text-slate-500 max-w-md mx-auto">
          Silakan pilih kategori riwayat transaksi yang ingin Anda lihat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {/* JAHIT */}
        <Link
          href="/dashboard/payroll/riwayat/jahit"
          className="group flex flex-col items-center text-center p-10 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300"
        >
          <div className="h-20 w-20 bg-blue-50/50 border border-blue-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-500">
            <Shirt className="h-9 w-9 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Riwayat Jahit
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Log borongan per karyawan.
          </p>
        </Link>

        {/* POTONG */}
        <Link
          href="/dashboard/payroll/riwayat/cutting"
          className="group flex flex-col items-center text-center p-10 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all duration-300"
        >
          <div className="h-20 w-20 bg-indigo-50/50 border border-indigo-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-500">
            <Scissors className="h-9 w-9 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Riwayat Potong
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Log pemotongan kain.
          </p>
        </Link>

        {/* HARIAN */}
        <Link
          href="/dashboard/payroll/riwayat/harian"
          className="group flex flex-col items-center text-center p-10 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
        >
          <div className="h-20 w-20 bg-emerald-50/50 border border-emerald-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-500">
            <FileSignature className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Riwayat Harian
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Log presensi dan gaji karyawan harian.
          </p>
        </Link>
      </div>
    </div>
  );
}

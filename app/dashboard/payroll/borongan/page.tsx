// app/dashboard/payroll/borongan/page.tsx
import Link from "next/link";
import { Scissors, Shirt } from "lucide-react";

export default function PayrollBoronganEntryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-in fade-in zoom-in-95 duration-500">
      {/* Teks Header di Tengah */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Pilih Proses Borongan
        </h1>
        <p className="text-base text-slate-500 max-w-md mx-auto">
          Silakan pilih jenis pekerjaan yang akan diinput rekapitulasi gajinya.
        </p>
      </div>

      {/* Grid Pilihan di Tengah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full px-4">
        {/* CARD JAHIT */}
        <Link
          href="/dashboard/payroll/borongan/jahit"
          className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-slate-900"
        >
          <div className="h-24 w-24 bg-blue-50/50 border border-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-500">
            <Shirt className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Proses Jahit</h2>
          <p className="text-slate-500 mt-2 text-sm text-center">
            Input hasil borongan khusus karyawan jahit.
          </p>
        </Link>

        {/* CARD POTONG */}
        <Link
          href="/dashboard/payroll/borongan/cutting"
          className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-slate-900"
        >
          <div className="h-24 w-24 bg-indigo-50/50 border border-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-500">
            <Scissors className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Proses Potong</h2>
          <p className="text-slate-500 mt-2 text-sm text-center">
            Input hasil borongan khusus karyawan potong kain.
          </p>
        </Link>
      </div>
    </div>
  );
}

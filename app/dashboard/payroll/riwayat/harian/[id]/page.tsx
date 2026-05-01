import { getDailyDetail } from "@/lib/actions/riwayat";
import { FileSignature, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export default async function HarianDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { header, items } = await getDailyDetail(Number(id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/dashboard/payroll/riwayat/harian"
        className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 mb-2 hover:bg-emerald-50 border-emerald-200">
            Gaji & Absen Harian
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {header?.code}
          </h1>
          <p className="text-slate-500 mt-1">
            Dibuat oleh:{" "}
            <span className="font-semibold">{header?.operator}</span> pada{" "}
            {header?.date}
          </p>
        </div>
        <div className="bg-slate-950 text-white rounded-xl p-5 min-w-[280px]">
          <p className="text-slate-400 text-sm font-semibold uppercase">
            Total Gaji Dibayarkan
          </p>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            {formatRp(Number(header?.grandTotal))}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Karyawan & Status</th>
              <th className="px-6 py-4 text-center">Gaji Pokok</th>
              <th className="px-6 py-4">Tambahan & Alasan</th>
              <th className="px-6 py-4">Potongan & Alasan</th>
              <th className="px-6 py-4 text-right">Total Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const isHadir = item.status === "hadir";
              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/50 ${!isHadir ? "opacity-60 bg-slate-50" : ""}`}
                >
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">
                      {item.employeeName}
                    </div>
                    <div
                      className={`mt-1 text-xs font-semibold flex items-center gap-1 ${isHadir ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {isHadir ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {isHadir ? "Hadir" : "Tidak Hadir"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-700">
                    {formatRp(Number(item.baseSalary))}
                  </td>
                  <td className="px-6 py-5">
                    {Number(item.bonus) > 0 ? (
                      <div>
                        <span className="font-bold text-blue-600">
                          +{formatRp(Number(item.bonus))}
                        </span>
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          {item.bonusReason}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {Number(item.deduction) > 0 ? (
                      <div>
                        <span className="font-bold text-red-500">
                          -{formatRp(Number(item.deduction))}
                        </span>
                        <p className="text-xs text-slate-500 italic mt-0.5">
                          {item.deductionReason}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-emerald-700 text-base">
                    {formatRp(Number(item.subtotal))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

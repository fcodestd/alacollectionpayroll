import { getCuttingDetail } from "@/lib/actions/riwayat";
import { Scissors, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export default async function CuttingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { header, items } = await getCuttingDetail(Number(id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/dashboard/payroll/riwayat/cutting"
        className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <Badge className="bg-indigo-50 text-indigo-700 mb-2 hover:bg-indigo-50 border-indigo-200">
            Batch Potong Kain
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
            Total Batch
          </p>
          <p className="text-3xl font-black text-indigo-400 mt-1">
            {formatRp(Number(header?.grandTotal))}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Karyawan Potong</th>
              <th className="px-6 py-4 text-center">Jumlah Roll</th>
              <th className="px-6 py-4 text-right">Tarif Dasar</th>
              <th className="px-6 py-4 text-right">Total Bersih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  {item.employeeName}
                </td>
                <td className="px-6 py-4 text-center font-bold">
                  {Number(item.qtyInRoll)} Roll
                </td>
                <td className="px-6 py-4 text-right text-slate-500">
                  {formatRp(Number(item.pricePerRoll))}
                </td>
                <td className="px-6 py-4 text-right font-black text-indigo-700">
                  {formatRp(Number(item.subtotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getCuttingHistory } from "@/lib/actions/riwayat"
import CuttingRiwayatClient from "./cutting-client"

export default async function RiwayatCuttingPage(props: { searchParams: Promise<any> }) {
  const params = await props.searchParams;
  const history = await getCuttingHistory({ startDate: params.start, endDate: params.end, page: Number(params.page) || 1, limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Potong</h1>
        <p className="text-sm text-slate-500">Log transaksi batch potong kain.</p>
      </div>
      <CuttingRiwayatClient initialData={history.data} totalPages={history.totalPages} currentPage={history.currentPage} />
    </div>
  )
}
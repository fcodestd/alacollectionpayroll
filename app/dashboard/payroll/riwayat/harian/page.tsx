// app/dashboard/payroll/riwayat/harian/page.tsx
import { getDailyHistory } from "@/lib/actions/riwayat";
import HarianRiwayatClient from "./harian-client";

export default async function RiwayatHarianPage(props: {
  searchParams: Promise<any>;
}) {
  const params = await props.searchParams;

  // Meneruskan parameter URL ke fungsi database
  const history = await getDailyHistory({
    startDate: params.start,
    endDate: params.end,
    page: Number(params.page) || 1,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Harian
        </h1>
        <p className="text-sm text-slate-500">
          Log transaksi absensi dan penggajian karyawan harian.
        </p>
      </div>

      <HarianRiwayatClient
        initialData={history.data}
        totalPages={history.totalPages}
        currentPage={history.currentPage}
      />
    </div>
  );
}

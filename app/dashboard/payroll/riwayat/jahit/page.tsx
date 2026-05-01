import { getJahitHistory } from "@/lib/actions/riwayat";
import JahitRiwayatClient from "./jahit-client";

export default async function RiwayatJahitPage(props: {
  searchParams: Promise<any>;
}) {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const startDate = params.start || "";
  const endDate = params.end || "";

  const history = await getJahitHistory({
    startDate,
    endDate,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Jahit
        </h1>
        <p className="text-sm text-slate-500">
          Log transaksi borongan khusus penjahit.
        </p>
      </div>
      <JahitRiwayatClient
        initialData={history.data}
        totalPages={history.totalPages}
        currentPage={history.currentPage}
      />
    </div>
  );
}

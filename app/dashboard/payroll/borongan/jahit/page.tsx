import { getBoronganJahitEmployees } from "@/lib/actions/payroll";
import JahitClientPage from "./jahit-client";

export default async function PayrollBoronganJahitPage() {
  // Hanya ambil karyawan borongan jahit sesuai request
  const empJahit = await getBoronganJahitEmployees();

  // SIMULASI: ID user admin yang sedang login
  const currentOperatorId = 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Input Borongan Jahit
        </h1>
        <p className="text-sm text-slate-500">
          Pilih karyawan jahit dan masukkan rincian produk yang diselesaikan.
        </p>
      </div>

      <JahitClientPage employees={empJahit} operatorId={currentOperatorId} />
    </div>
  );
}

// app/dashboard/payroll/borongan/cutting/page.tsx
import { getBoronganPotongEmployees } from "@/lib/actions/cutting";
import CuttingClientPage from "./cutting-client";

export default async function PayrollBoronganCuttingPage() {
  const empPotong = await getBoronganPotongEmployees();

  // SIMULASI: ID user admin yang sedang login
  const currentOperatorId = 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Input Borongan Potong (Batch)
        </h1>
        <p className="text-sm text-slate-500">
          Satu tanggal untuk satu gelombang pemotongan kain. Harga borongan
          dipukul rata per roll.
        </p>
      </div>

      <CuttingClientPage employees={empPotong} operatorId={currentOperatorId} />
    </div>
  );
}

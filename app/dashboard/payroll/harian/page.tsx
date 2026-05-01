// app/dashboard/payroll/harian/page.tsx
import { getHarianEmployees } from "@/lib/actions/harian";
import HarianClientPage from "./harian-client";

export default async function PayrollHarianPage() {
  const empHarian = await getHarianEmployees();
  const currentOperatorId = 1; // Simulasi User ID

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Input Gaji Harian (Batch)
        </h1>
        <p className="text-sm text-slate-500">
          Proses absen dan gaji pokok harian untuk seluruh karyawan dalam satu
          hari.
        </p>
      </div>

      <HarianClientPage employees={empHarian} operatorId={currentOperatorId} />
    </div>
  );
}

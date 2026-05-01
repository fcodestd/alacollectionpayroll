import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import HarianRekapClient from "./harian-client";

export default async function RekapHarianPage() {
  const data = await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "harian"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Rekap Gaji Harian
        </h1>
        <p className="text-sm text-slate-500">
          Pilih karyawan harian untuk melihat absensi, rincian potongan/bonus,
          dan mencetak slip.
        </p>
      </div>
      <HarianRekapClient data={data} />
    </div>
  );
}

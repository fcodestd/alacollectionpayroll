import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import JahitRekapClient from "./jahit-client";

export default async function RekapJahitPage() {
  // Hanya ambil karyawan dengan jenis "borongan jahit"
  const data = await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan jahit"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Rekap Gaji Jahit
        </h1>
        <p className="text-sm text-slate-500">
          Pilih karyawan untuk melihat kalender riwayat jahitan dan mencetak
          slip gaji.
        </p>
      </div>

      <JahitRekapClient data={data} />
    </div>
  );
}

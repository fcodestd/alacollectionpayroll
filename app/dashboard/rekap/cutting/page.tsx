import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import PotongRekapClient from "./cutting-client";

export default async function RekapPotongPage() {
  const data = await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan potong"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Rekap Gaji Potong
        </h1>
        <p className="text-sm text-slate-500">
          Pilih karyawan potong untuk melihat riwayat dan mencetak slip gaji.
        </p>
      </div>
      <PotongRekapClient data={data} />
    </div>
  );
}

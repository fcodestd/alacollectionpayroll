// app/employee/kinerja/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import KinerjaClient from "./kinerja-client";

export default async function EmployeeKinerjaPage() {
  const session = await auth();

  // Proteksi rute
  if (!session || !session.user?.employeeId) {
    redirect("/employee");
  }

  const employeeId = parseInt(session.user.employeeId);

  // Ambil data karyawan dari database untuk memastikan jenisnya akurat
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId));

  if (!employee) {
    redirect("/employee");
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <KinerjaClient employee={employee} />
    </div>
  );
}

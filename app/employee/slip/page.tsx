// app/employee/slip/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  getPayrollReport,
  getCuttingReport,
  getDailyReport,
} from "@/lib/actions/report";
import EmployeeSlipClient from "./slip-client";

// Fungsi hitung minggu ini di sisi Server
const getThisWeekServer = () => {
  const curr = new Date();
  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(curr);
  start.setDate(curr.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dayStr}`;
  };

  return { start: format(start), end: format(end) };
};

export default async function EmployeeSlipPage() {
  const session = await auth();
  if (!session || !session.user?.employeeId) redirect("/employee");

  const employeeId = parseInt(session.user.employeeId);
  const jenis = (session.user.employeeJenis || "").toLowerCase();

  // Ambil profil karyawan lengkap
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId));
  if (!employee) redirect("/employee");

  const dates = getThisWeekServer();
  let reportData = {};

  // MENGAMBIL DATA SESUAI JENIS PEKERJAAN
  if (jenis.includes("jahit")) {
    reportData = await getPayrollReport(employeeId, dates.start, dates.end);
  } else if (jenis.includes("potong")) {
    reportData = await getCuttingReport(employeeId, dates.start, dates.end);
  } else if (jenis.includes("harian")) {
    reportData = await getDailyReport(employeeId, dates.start, dates.end);
  }

  return (
    <div className="p-6 pt-10 min-h-screen bg-slate-50">
      <EmployeeSlipClient
        employee={employee}
        data={reportData}
        jenis={jenis}
        startDate={dates.start}
        endDate={dates.end}
      />
    </div>
  );
}

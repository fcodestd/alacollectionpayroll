// app/dashboard/master/employees/page.tsx
import {
  getEmployees,
  getEligibleUsers,
  getLinkedUserIds,
} from "@/lib/actions/employee";
import EmployeeClientPage from "./employee-client";

export default async function MasterEmployeePage(props: {
  searchParams: Promise<any>;
}) {
  const params = await props.searchParams;
  const q = params.q || "";
  const page = Number(params.page) || 1;

  const { data, totalPages } = await getEmployees(q, page);
  const eligibleUsers = await getEligibleUsers();
  const linkedUserIds = await getLinkedUserIds(); // Panggil ID yang sudah dipakai

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Master Karyawan
        </h1>
        <p className="text-sm text-slate-500">
          Kelola data tenaga kerja dan tautkan dengan akun sistem mereka.
        </p>
      </div>

      {/* Lempar linkedUserIds ke Client */}
      <EmployeeClientPage
        data={data}
        totalPages={totalPages}
        eligibleUsers={eligibleUsers}
        linkedUserIds={linkedUserIds}
      />
    </div>
  );
}

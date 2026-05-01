import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import DetailHarianClientPage from "./detail-harian-client";

export default async function RekapHarianDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const employeeId = parseInt(id);

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, employeeId));
  if (!employee) return notFound();

  return <DetailHarianClientPage employee={employee} />;
}

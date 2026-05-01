// app/employee/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import ProfileClient from "./profile-client";

export default async function EmployeeProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);

  // Ambil data akun (Username & Password)
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) redirect("/login");

  // Ambil data detail karyawan (Tugas/Jabatan)
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId));

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ProfileClient user={user} employee={employee} />
    </div>
  );
}

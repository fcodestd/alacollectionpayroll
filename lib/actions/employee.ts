// lib/actions/employee.ts
"use server";

import { db } from "@/lib/db";
import { employees, users } from "@/lib/schema";
import { eq, ilike, count, inArray, isNotNull } from "drizzle-orm"; // Tambahkan isNotNull
import { revalidatePath } from "next/cache";

// --- 1. GET EMPLOYEES ---
export async function getEmployees(query: string, page: number) {
  const limit = 10;
  const offset = (page - 1) * limit;

  const data = await db
    .select({
      id: employees.id,
      name: employees.name,
      jenis: employees.jenis,
      userId: employees.userId,
      userFullname: users.fullname,
      userUsername: users.username,
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(ilike(employees.name, `%${query}%`))
    .limit(limit)
    .offset(offset);

  const totalReq = await db
    .select({ value: count() })
    .from(employees)
    .where(ilike(employees.name, `%${query}%`));

  return { data, totalPages: Math.ceil(totalReq[0].value / limit) };
}

// --- 2. GET ELIGIBLE USERS ---
export async function getEligibleUsers() {
  return await db
    .select({
      id: users.id,
      fullname: users.fullname,
      username: users.username,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.role, ["admin", "karyawan"]));
}

// --- 3. GET LINKED USER IDs (FUNGSI BARU) ---
// Mengambil semua ID User yang sudah tertaut ke karyawan manapun
export async function getLinkedUserIds() {
  const linked = await db
    .select({ userId: employees.userId })
    .from(employees)
    .where(isNotNull(employees.userId));

  return linked.map((e) => e.userId as number);
}

// --- 4. CREATE EMPLOYEE ---
export async function createEmployee(values: any) {
  try {
    await db.insert(employees).values({
      name: values.name,
      jenis: values.jenis,
      userId: values.userId ? Number(values.userId) : null,
    });
    revalidatePath("/dashboard/master/employees");
    return { success: true, message: "Karyawan berhasil ditambahkan" };
  } catch (e) {
    return { success: false, message: "Gagal menyimpan data karyawan" };
  }
}

// --- 5. UPDATE EMPLOYEE ---
export async function updateEmployee(id: number, values: any) {
  try {
    await db
      .update(employees)
      .set({
        name: values.name,
        jenis: values.jenis,
        userId: values.userId ? Number(values.userId) : null,
      })
      .where(eq(employees.id, id));

    revalidatePath("/dashboard/master/employees");
    return { success: true, message: "Data karyawan berhasil diperbarui" };
  } catch (e) {
    return { success: false, message: "Gagal memperbarui data" };
  }
}

// --- 6. DELETE EMPLOYEE ---
export async function deleteEmployee(id: number) {
  try {
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath("/dashboard/master/employees");
    return { success: true, message: "Karyawan berhasil dihapus" };
  } catch (e) {
    return {
      success: false,
      message: "Gagal: Karyawan ini mungkin terikat pada data Payroll.",
    };
  }
}

// lib/actions/payroll.ts
"use server";

import { db } from "@/lib/db";
import { employees, products, payrolls, payrollItems } from "@/lib/schema";
import { eq, ilike, inArray } from "drizzle-orm";

// 1. Ambil karyawan borongan
export async function getBoronganEmployees() {
  return await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan"));
}

// 2. Pencarian Produk Live
export async function searchProducts(query: string) {
  return await db
    .select()
    .from(products)
    .where(ilike(products.name, `%${query}%`))
    .limit(10);
}

// 3. Insert Draft Header Payroll
export async function createDraftPayroll(
  employeeId: number,
  operatorId: number,
  type: string,
) {
  try {
    // Generate kode unik, contoh: PAY-JAHIT-1712345678
    const code = `PAY-${type.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const [newPayroll] = await db
      .insert(payrolls)
      .values({
        code: code,
        employeeId: employeeId,
        operatorId: operatorId, // Didapat dari session user login
        grandTotal: "0.00",
        // createdAt biarkan defaultNow atau bisa diatur nanti
      })
      .returning({ id: payrolls.id, code: payrolls.code });

    return { success: true, data: newPayroll };
  } catch (error) {
    return { success: false, message: "Gagal membuat draft payroll" };
  }
}

// 4. Finalisasi (Update Header & Batch Insert Items)
export async function finalizePayroll(
  payrollId: number,
  items: any[],
  grandTotal: number,
) {
  try {
    // Update Header
    await db
      .update(payrolls)
      .set({ grandTotal: grandTotal.toString() })
      .where(eq(payrolls.id, payrollId));

    // Siapkan data untuk batch insert
    const payloadItems = items.map((item) => ({
      payrollId: payrollId,
      productId: item.productId,
      price: item.price.toString(),
      qty: item.qty,
      subtotal: item.subtotal.toString(),
    }));

    // Batch Insert Item
    await db.insert(payrollItems).values(payloadItems);

    return { success: true, message: "Payroll borongan berhasil disimpan" };
  } catch (error) {
    return { success: false, message: "Gagal memfinalisasi payroll" };
  }
}

// FUNGSI BARU: Ambil KHUSUS karyawan borongan jahit
export async function getBoronganJahitEmployees() {
  return await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan jahit"));
}

// FUNGSI BARU NANTI UNTUK CUTTING (Sebagai persiapan)
export async function getBoronganPotongEmployees() {
  return await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan potong"));
}

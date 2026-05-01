// lib/actions/harian.ts
"use server";

import { db } from "@/lib/db";
import { employees, dailyBatches, dailyBatchItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// 1. Ambil karyawan Harian
export async function getHarianEmployees() {
  return await db.select().from(employees).where(eq(employees.jenis, "harian"));
}

// 2. Cek duplikasi tanggal
export async function checkExistingDailyBatch(dateStr: string) {
  const existing = await db
    .select()
    .from(dailyBatches)
    .where(eq(dailyBatches.date, dateStr));

  return existing.length > 0;
}

// 3. Buat Draft Header
export async function createDraftDailyBatch(
  operatorId: number,
  dateStr: string,
) {
  try {
    const code = `BATCH-HRN-${Date.now().toString().slice(-6)}`;

    const [newBatch] = await db
      .insert(dailyBatches)
      .values({
        batchCode: code,
        date: dateStr,
        operatorId: operatorId,
        grandTotal: "0.00",
      })
      .returning({ id: dailyBatches.id, batchCode: dailyBatches.batchCode });

    return { success: true, data: newBatch };
  } catch (error) {
    return { success: false, message: "Gagal membuat draft batch harian." };
  }
}

// 4. Batalkan (Hapus Header)
export async function deleteDraftDailyBatch(batchId: number) {
  try {
    await db.delete(dailyBatches).where(eq(dailyBatches.id, batchId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// 5. Finalisasi Transaksi
export async function finalizeDailyBatch(
  batchId: number,
  items: any[],
  grandTotal: number,
) {
  try {
    await db
      .update(dailyBatches)
      .set({ grandTotal: grandTotal.toString() })
      .where(eq(dailyBatches.id, batchId));

    // Mapping payload untuk insert
    const payloadItems = items.map((item) => ({
      batchId: batchId,
      employeeId: item.employeeId,
      status: item.status,
      baseSalary: item.baseSalary.toString(),
      deduction: item.deduction.toString(),
      deductionReason: item.deductionReason || null,
      bonus: item.bonus.toString(),
      bonusReason: item.bonusReason || null,
      subtotal: item.subtotal.toString(),
    }));

    if (payloadItems.length > 0) {
      await db.insert(dailyBatchItems).values(payloadItems);
    }

    return { success: true, message: "Gaji harian berhasil dikunci." };
  } catch (error) {
    return { success: false, message: "Gagal memfinalisasi data." };
  }
}

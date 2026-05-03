// lib/actions/cutting.ts
"use server";

import { db } from "@/lib/db";
import { employees, cuttingBatches, cuttingBatchItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

// 1. Ambil karyawan khusus Borongan Potong
export async function getBoronganPotongEmployees() {
  return await db
    .select()
    .from(employees)
    .where(eq(employees.jenis, "borongan potong"));
}

// 2. Cek apakah di tanggal tersebut sudah ada batch potong
export async function checkExistingCuttingBatch(dateStr: string) {
  const existing = await db
    .select()
    .from(cuttingBatches)
    .where(eq(cuttingBatches.date, dateStr));

  return existing.length > 0;
}

// 3. Buat Draft Header
export async function createDraftCuttingBatch(
  operatorId: number,
  dateStr: string,
) {
  try {
    // Generate kode unik
    const code = `BATCH-CUT-${Date.now().toString().slice(-6)}`;

    const [newBatch] = await db
      .insert(cuttingBatches)
      .values({
        batchCode: code,
        date: dateStr,
        operatorId: operatorId,
        grandTotal: "0.00",
      })
      .returning({
        id: cuttingBatches.id,
        batchCode: cuttingBatches.batchCode,
      });

    return { success: true, data: newBatch };
  } catch (error) {
    return { success: false, message: "Gagal membuat draft batch potong." };
  }
}

// 4. Batalkan (Hapus Header)
export async function deleteDraftCuttingBatch(batchId: number) {
  try {
    await db.delete(cuttingBatches).where(eq(cuttingBatches.id, batchId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// app/lib/actions/cutting.ts (CARI FUNGSI INI DAN SESUAIKAN)

export async function finalizeCuttingBatch(
  draftId: number,
  items: any[],
  grandTotal: number,
) {
  try {
    // 1. Filter hanya karyawan yang memiliki qty lebih dari 0
    const validItems = items.filter((i) => i.qty > 0);

    // 2. Insert ke tabel cuttingBatchItems (mengikuti skema baru yang memiliki kolom 'unit')
    const insertData = validItems.map((item) => ({
      batchId: draftId,
      employeeId: item.employeeId,
      qty: item.qty.toString(), // <-- Mengisi kolom qty
      unit: item.unit, // <-- Mengisi kolom unit (roll/pcs)
      price: item.price.toString(), // <-- Mengisi kolom price
      subtotal: item.subtotal.toString(),
    }));

    if (insertData.length > 0) {
      await db.insert(cuttingBatchItems).values(insertData);
    }

    // 3. Update grand total di tabel header (cuttingBatches)
    await db
      .update(cuttingBatches)
      .set({ grandTotal: grandTotal.toString() })
      .where(eq(cuttingBatches.id, draftId));

    return { success: true };
  } catch (error) {
    console.error("Gagal Finalisasi Cutting:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan data ke database.",
    };
  }
}

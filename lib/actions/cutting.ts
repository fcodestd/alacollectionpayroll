// lib/actions/cutting.ts
"use server"

import { db } from "@/lib/db"
import { employees, cuttingBatches, cuttingBatchItems } from "@/lib/schema"
import { eq } from "drizzle-orm"

// 1. Ambil karyawan khusus Borongan Potong
export async function getBoronganPotongEmployees() {
  return await db.select()
    .from(employees)
    .where(eq(employees.jenis, "borongan potong"))
}

// 2. Cek apakah di tanggal tersebut sudah ada batch potong
export async function checkExistingCuttingBatch(dateStr: string) {
  const existing = await db.select()
    .from(cuttingBatches)
    .where(eq(cuttingBatches.date, dateStr))
  
  return existing.length > 0
}

// 3. Buat Draft Header
export async function createDraftCuttingBatch(operatorId: number, dateStr: string) {
  try {
    // Generate kode unik
    const code = `BATCH-CUT-${Date.now().toString().slice(-6)}`
    
    const [newBatch] = await db.insert(cuttingBatches).values({
      batchCode: code,
      date: dateStr,
      operatorId: operatorId,
      grandTotal: "0.00",
    }).returning({ id: cuttingBatches.id, batchCode: cuttingBatches.batchCode })

    return { success: true, data: newBatch }
  } catch (error) {
    return { success: false, message: "Gagal membuat draft batch potong." }
  }
}

// 4. Batalkan (Hapus Header)
export async function deleteDraftCuttingBatch(batchId: number) {
  try {
    await db.delete(cuttingBatches).where(eq(cuttingBatches.id, batchId))
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

// 5. Finalisasi (Update Grand Total & Insert Items)
export async function finalizeCuttingBatch(batchId: number, items: any[], grandTotal: number) {
  try {
    // Update Header Grand Total
    await db.update(cuttingBatches)
      .set({ grandTotal: grandTotal.toString() })
      .where(eq(cuttingBatches.id, batchId))

    // Siapkan data items (HANYA insert karyawan yang QTY-nya lebih dari 0)
    const payloadItems = items
      .filter((item) => item.qty > 0)
      .map((item) => ({
        batchId: batchId,
        employeeId: item.employeeId,
        qtyInRoll: item.qty.toString(),
        pricePerRoll: item.price.toString(),
        subtotal: item.subtotal.toString()
      }))

    if (payloadItems.length > 0) {
      await db.insert(cuttingBatchItems).values(payloadItems)
    }

    return { success: true, message: "Batch potong berhasil disimpan" }
  } catch (error) {
    return { success: false, message: "Gagal memfinalisasi data." }
  }
}
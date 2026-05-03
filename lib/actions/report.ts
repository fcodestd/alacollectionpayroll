// lib/actions/report.ts
"use server";

import { db } from "@/lib/db";
import {
  employees,
  payrolls,
  payrollItems,
  products,
  cuttingBatches,
  cuttingBatchItems,
  dailyBatches,
  dailyBatchItems,
} from "@/lib/schema";
import { eq, ilike, and, gte, lte } from "drizzle-orm";

// 1. Dapatkan daftar karyawan untuk halaman awal
export async function getEmployeesForReport(query: string) {
  return await db
    .select({
      id: employees.id,
      name: employees.name,
      jenis: employees.jenis,
    })
    .from(employees)
    .where(ilike(employees.name, `%${query}%`))
    .limit(20);
}

// 2. Dapatkan detail karyawan
export async function getEmployeeDetail(id: number) {
  const [emp] = await db.select().from(employees).where(eq(employees.id, id));
  return emp;
}

// 3. Tarik data & Agregasi Laporan Penggajian
export async function getPayrollReport(
  employeeId: number,
  startDate: string,
  endDate: string,
) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  const records = await db
    .select({
      date: payrolls.createdAt,
      productName: products.name,
      price: payrollItems.price,
      qty: payrollItems.qty,
      subtotal: payrollItems.subtotal,
    })
    .from(payrolls)
    .innerJoin(payrollItems, eq(payrolls.id, payrollItems.payrollId))
    .innerJoin(products, eq(payrollItems.productId, products.id))
    .where(
      and(
        eq(payrolls.employeeId, employeeId),
        gte(payrolls.createdAt, start),
        lte(payrolls.createdAt, end),
      ),
    );

  // Agregasi di sisi server (Group by Tanggal -> Group by Produk)
  const grouped: Record<
    string,
    Record<string, { price: number; qty: number; subtotal: number }>
  > = {};

  records.forEach((row) => {
    if (!row.date) return;
    // Ambil tanggal lokal (YYYY-MM-DD)
    const dateStr = row.date.toISOString().split("T")[0];

    if (!grouped[dateStr]) grouped[dateStr] = {};

    const pName = row.productName;
    if (!grouped[dateStr][pName]) {
      grouped[dateStr][pName] = {
        price: Number(row.price),
        qty: 0,
        subtotal: 0,
      };
    }

    grouped[dateStr][pName].qty += row.qty;
    grouped[dateStr][pName].subtotal += Number(row.subtotal);
  });

  return grouped;
}

export async function getCuttingReport(
  employeeId: number,
  startDate: string,
  endDate: string,
) {
  // 1. Ambil data dari database
  const queryResult = await db
    .select({
      date: cuttingBatches.date,
      qty: cuttingBatchItems.qty,
      unit: cuttingBatchItems.unit, // <--- INI KUNCI UTAMANYA! Pastikan unit diambil
      price: cuttingBatchItems.price,
      subtotal: cuttingBatchItems.subtotal,
    })
    .from(cuttingBatchItems)
    .innerJoin(cuttingBatches, eq(cuttingBatchItems.batchId, cuttingBatches.id))
    .where(
      and(
        eq(cuttingBatchItems.employeeId, employeeId),
        gte(cuttingBatches.date, startDate),
        lte(cuttingBatches.date, endDate),
      ),
    );

  // 2. Format data menjadi object Record<string, data> agar mudah dibaca oleh Frontend UI
  const formattedData: Record<
    string,
    { qty: number; unit: string; price: number; subtotal: number }
  > = {};

  queryResult.forEach((row) => {
    // Karena tipe data date bisa berupa objek Date atau string YYYY-MM-DD tergantung driver postgres, kita pastikan formatnya:
    const dateStr =
      typeof row.date === "string"
        ? row.date
        : row.date.toISOString().split("T")[0];

    // Jika dalam 1 hari ada 2 sesi potong, kita totalkan (opsional, tergantung alur bisnis)
    if (formattedData[dateStr]) {
      formattedData[dateStr].qty += Number(row.qty);
      formattedData[dateStr].subtotal += Number(row.subtotal);
    } else {
      formattedData[dateStr] = {
        qty: Number(row.qty),
        unit: row.unit || "roll", // <--- Masukkan unit-nya ke dalam objek hasil
        price: Number(row.price),
        subtotal: Number(row.subtotal),
      };
    }
  });

  return formattedData;
}

export async function getDailyReport(
  employeeId: number,
  startDate: string,
  endDate: string,
) {
  const records = await db
    .select({
      date: dailyBatches.date,
      status: dailyBatchItems.status,
      baseSalary: dailyBatchItems.baseSalary,
      bonus: dailyBatchItems.bonus,
      bonusReason: dailyBatchItems.bonusReason,
      deduction: dailyBatchItems.deduction,
      deductionReason: dailyBatchItems.deductionReason,
      subtotal: dailyBatchItems.subtotal,
    })
    .from(dailyBatchItems)
    .innerJoin(dailyBatches, eq(dailyBatchItems.batchId, dailyBatches.id))
    .where(
      and(
        eq(dailyBatchItems.employeeId, employeeId),
        gte(dailyBatches.date, startDate),
        lte(dailyBatches.date, endDate),
      ),
    );

  const result: Record<string, any> = {};

  records.forEach((row) => {
    // Karena sistem absensi harusnya 1 entri per hari, kita langsung set valuenya
    result[row.date] = {
      status: row.status,
      baseSalary: Number(row.baseSalary),
      bonus: Number(row.bonus),
      bonusReason: row.bonusReason,
      deduction: Number(row.deduction),
      deductionReason: row.deductionReason,
      subtotal: Number(row.subtotal),
    };
  });

  return result;
}

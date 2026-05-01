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
  const records = await db
    .select({
      date: cuttingBatches.date,
      qty: cuttingBatchItems.qtyInRoll,
      price: cuttingBatchItems.pricePerRoll,
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

  // Agregasi per tanggal (Meskipun harusnya 1 hari 1 batch, ini untuk safety)
  const result: Record<
    string,
    { qty: number; price: number; subtotal: number }
  > = {};

  records.forEach((row) => {
    const dStr = row.date;
    if (!result[dStr]) {
      result[dStr] = { qty: 0, price: Number(row.price), subtotal: 0 };
    }
    result[dStr].qty += Number(row.qty);
    result[dStr].subtotal += Number(row.subtotal);
    // Jika ada update harga di hari yg sama, kita ambil yang terakhir
    result[dStr].price = Number(row.price);
  });

  return result;
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

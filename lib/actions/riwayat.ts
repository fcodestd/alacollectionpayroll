// lib/actions/riwayat.ts
"use server";

import { db } from "@/lib/db";
import {
  payrolls,
  payrollItems,
  products,
  cuttingBatches,
  cuttingBatchItems,
  dailyBatches,
  dailyBatchItems,
  users,
  employees,
} from "@/lib/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Tambahkan ke dalam lib/actions/riwayat.ts

export async function getUnifiedHistory(params: {
  limit?: number;
  type?: string;
  page?: number;
}) {
  const { limit = 5 } = params; // Default ambil 5 data terbaru

  // 1. Ambil Data Jahit Terakhir
  const jahitRaw = await db
    .select({
      id: payrolls.id,
      code: payrolls.code,
      date: payrolls.createdAt,
      grandTotal: payrolls.grandTotal,
      employeeName: employees.name,
    })
    .from(payrolls)
    .leftJoin(employees, eq(payrolls.employeeId, employees.id))
    .orderBy(desc(payrolls.createdAt))
    .limit(limit);

  // 2. Ambil Data Potong Terakhir
  const potongRaw = await db
    .select({
      id: cuttingBatches.id,
      code: cuttingBatches.batchCode,
      date: cuttingBatches.date,
      grandTotal: cuttingBatches.grandTotal,
    })
    .from(cuttingBatches)
    .orderBy(desc(cuttingBatches.date))
    .limit(limit);

  // 3. Ambil Data Harian Terakhir
  const harianRaw = await db
    .select({
      id: dailyBatches.id,
      code: dailyBatches.batchCode,
      date: dailyBatches.date,
      grandTotal: dailyBatches.grandTotal,
    })
    .from(dailyBatches)
    .orderBy(desc(dailyBatches.date))
    .limit(limit);

  // 4. Normalisasi dan Gabungkan Data
  const unified = [
    ...jahitRaw.map((item) => ({
      id: item.id,
      code: item.code || "N/A",
      type: "jahit" as const,
      date: item.date ? new Date(item.date) : new Date(),
      employeeName: item.employeeName || "-",
      grandTotal: Number(item.grandTotal),
    })),
    ...potongRaw.map((item) => ({
      id: item.id,
      code: item.code,
      type: "potong" as const,
      date: new Date(`${item.date}T00:00:00`),
      employeeName: "-", // Potong menggunakan sistem batch
      grandTotal: Number(item.grandTotal),
    })),
    ...harianRaw.map((item) => ({
      id: item.id,
      code: item.code,
      type: "harian" as const,
      date: new Date(`${item.date}T00:00:00`),
      employeeName: "-", // Harian menggunakan sistem batch
      grandTotal: Number(item.grandTotal),
    })),
  ];

  // 5. Urutkan dari yang paling baru (Descending)
  unified.sort((a, b) => b.date.getTime() - a.date.getTime());

  // 6. Potong array sesuai limit yang diminta dashboard
  return {
    data: unified.slice(0, limit),
  };
}

// 1. RIWAYAT JAHIT
export async function getJahitHistory(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { startDate, endDate, page = 1, limit = 10 } = params;
  const conds = [];
  if (startDate)
    conds.push(gte(payrolls.createdAt, new Date(`${startDate}T00:00:00`)));
  if (endDate)
    conds.push(lte(payrolls.createdAt, new Date(`${endDate}T23:59:59`)));

  const baseQuery = db
    .select({
      id: payrolls.id,
      code: payrolls.code,
      date: payrolls.createdAt,
      grandTotal: payrolls.grandTotal,
      operatorName: users.fullname,
      employeeName: employees.name,
    })
    .from(payrolls)
    .leftJoin(users, eq(payrolls.operatorId, users.id))
    .leftJoin(employees, eq(payrolls.employeeId, employees.id))
    .where(conds.length > 0 ? and(...conds) : undefined)
    .orderBy(desc(payrolls.createdAt));

  const data = await baseQuery.limit(limit).offset((page - 1) * limit);
  const totalData = (await baseQuery).length;

  return {
    data,
    totalPages: Math.ceil(totalData / limit) || 1,
    currentPage: page,
  };
}

// 2. RIWAYAT CUTTING (POTONG)
export async function getCuttingHistory(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { startDate, endDate, page = 1, limit = 10 } = params;
  const conds = [];
  if (startDate) conds.push(gte(cuttingBatches.date, startDate));
  if (endDate) conds.push(lte(cuttingBatches.date, endDate));

  const baseQuery = db
    .select({
      id: cuttingBatches.id,
      code: cuttingBatches.batchCode,
      date: cuttingBatches.date,
      grandTotal: cuttingBatches.grandTotal,
      operatorName: users.fullname,
    })
    .from(cuttingBatches)
    .leftJoin(users, eq(cuttingBatches.operatorId, users.id))
    .where(conds.length > 0 ? and(...conds) : undefined)
    .orderBy(desc(cuttingBatches.date));

  const data = await baseQuery.limit(limit).offset((page - 1) * limit);
  const totalData = (await baseQuery).length;

  return {
    data,
    totalPages: Math.ceil(totalData / limit) || 1,
    currentPage: page,
  };
}

// 3. RIWAYAT HARIAN
export async function getDailyHistory(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { startDate, endDate, page = 1, limit = 10 } = params;
  const conds = [];
  if (startDate) conds.push(gte(dailyBatches.date, startDate));
  if (endDate) conds.push(lte(dailyBatches.date, endDate));

  const baseQuery = db
    .select({
      id: dailyBatches.id,
      code: dailyBatches.batchCode,
      date: dailyBatches.date,
      grandTotal: dailyBatches.grandTotal,
      operatorName: users.fullname,
    })
    .from(dailyBatches)
    .leftJoin(users, eq(dailyBatches.operatorId, users.id))
    .where(conds.length > 0 ? and(...conds) : undefined)
    .orderBy(desc(dailyBatches.date));

  const data = await baseQuery.limit(limit).offset((page - 1) * limit);
  const totalData = (await baseQuery).length;

  return {
    data,
    totalPages: Math.ceil(totalData / limit) || 1,
    currentPage: page,
  };
}

// 2. AMBIL DETAIL JAHIT (Untuk Modal)
export async function getJahitDetail(payrollId: number) {
  return await db
    .select({
      productName: products.name,
      qty: payrollItems.qty,
      price: payrollItems.price,
      subtotal: payrollItems.subtotal,
    })
    .from(payrollItems)
    .innerJoin(products, eq(payrollItems.productId, products.id))
    .where(eq(payrollItems.payrollId, payrollId));
}

// 3. AMBIL DETAIL POTONG (Untuk Halaman Baru)
export async function getCuttingDetail(batchId: number) {
  const [header] = await db
    .select({
      code: cuttingBatches.batchCode,
      date: cuttingBatches.date,
      grandTotal: cuttingBatches.grandTotal,
      operator: users.fullname,
    })
    .from(cuttingBatches)
    .leftJoin(users, eq(cuttingBatches.operatorId, users.id))
    .where(eq(cuttingBatches.id, batchId));

  const items = await db
    .select({
      employeeName: employees.name,
      qtyInRoll: cuttingBatchItems.qtyInRoll,
      pricePerRoll: cuttingBatchItems.pricePerRoll,
      subtotal: cuttingBatchItems.subtotal,
    })
    .from(cuttingBatchItems)
    .innerJoin(employees, eq(cuttingBatchItems.employeeId, employees.id))
    .where(eq(cuttingBatchItems.batchId, batchId));

  return { header, items };
}

// 4. AMBIL DETAIL HARIAN (Untuk Halaman Baru)
export async function getDailyDetail(batchId: number) {
  const [header] = await db
    .select({
      code: dailyBatches.batchCode,
      date: dailyBatches.date,
      grandTotal: dailyBatches.grandTotal,
      operator: users.fullname,
    })
    .from(dailyBatches)
    .leftJoin(users, eq(dailyBatches.operatorId, users.id))
    .where(eq(dailyBatches.id, batchId));

  const items = await db
    .select({
      employeeName: employees.name,
      status: dailyBatchItems.status,
      baseSalary: dailyBatchItems.baseSalary,
      bonus: dailyBatchItems.bonus,
      bonusReason: dailyBatchItems.bonusReason,
      deduction: dailyBatchItems.deduction,
      deductionReason: dailyBatchItems.deductionReason,
      subtotal: dailyBatchItems.subtotal,
    })
    .from(dailyBatchItems)
    .innerJoin(employees, eq(dailyBatchItems.employeeId, employees.id))
    .where(eq(dailyBatchItems.batchId, batchId));

  return { header, items };
}

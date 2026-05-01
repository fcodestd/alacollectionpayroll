// lib/actions/dashboard.ts
"use server";

import { db } from "@/lib/db";
import {
  employees,
  products,
  users,
  payrolls,
  cuttingBatches,
  dailyBatches,
} from "@/lib/schema";
import { and, gte, lte, sql } from "drizzle-orm";

// 1. Ambil Statistik Kartu Utama
export async function getDashboardStats() {
  const [emp] = await db
    .select({ count: sql<number>`count(*)` })
    .from(employees);
  const [prod] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);
  const [admin] = await db.select({ count: sql<number>`count(*)` }).from(users);

  return {
    totalEmployees: Number(emp.count) || 0,
    totalProducts: Number(prod.count) || 0,
    totalAdmins: Number(admin.count) || 0,
  };
}

// 2. Ambil Agregasi Data Grafik per Bulan
export async function getDashboardChartData(month: string, year: string) {
  const y = parseInt(year);
  const m = parseInt(month);
  const daysInMonth = new Date(y, m, 0).getDate();

  // Format Tanggal untuk Drizzle Query
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59);
  const startStr = `${y}-${String(m).padStart(2, "0")}-01`;
  const endStr = `${y}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  // Tarik data dari ketiga tabel sumber pengeluaran
  const jahit = await db
    .select({ date: payrolls.createdAt, total: payrolls.grandTotal })
    .from(payrolls)
    .where(
      and(gte(payrolls.createdAt, startDate), lte(payrolls.createdAt, endDate)),
    );

  const potong = await db
    .select({ date: cuttingBatches.date, total: cuttingBatches.grandTotal })
    .from(cuttingBatches)
    .where(
      and(gte(cuttingBatches.date, startStr), lte(cuttingBatches.date, endStr)),
    );

  const harian = await db
    .select({ date: dailyBatches.date, total: dailyBatches.grandTotal })
    .from(dailyBatches)
    .where(
      and(gte(dailyBatches.date, startStr), lte(dailyBatches.date, endStr)),
    );

  // Inisialisasi kerangka data harian (Tanggal 1 sampai 30/31) bernilai 0
  const chartMap = new Map<number, number>();
  for (let i = 1; i <= daysInMonth; i++) chartMap.set(i, 0);

  // Masukkan & jumlahkan data Jahit
  jahit.forEach((item) => {
    if (!item.date) return;
    const day = item.date.getDate();
    chartMap.set(day, (chartMap.get(day) || 0) + Number(item.total));
  });

  // Masukkan & jumlahkan data Potong
  potong.forEach((item) => {
    if (!item.date) return;
    const day = new Date(item.date).getDate();
    chartMap.set(day, (chartMap.get(day) || 0) + Number(item.total));
  });

  // Masukkan & jumlahkan data Harian
  harian.forEach((item) => {
    if (!item.date) return;
    const day = new Date(item.date).getDate();
    chartMap.set(day, (chartMap.get(day) || 0) + Number(item.total));
  });

  // Konversi Map kembali menjadi Array yang dibutuhkan oleh Recharts
  return Array.from(chartMap.entries()).map(([day, total]) => ({
    date: day.toString(),
    total,
  }));
}

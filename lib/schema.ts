// lib/schema.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  numeric,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullname: varchar("fullname", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("karyawan"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  jenis: varchar("jenis", { length: 20 }).default("borongan"),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------------------------------------------------
// TABEL JAHIT (Menggunakan nama 'payrolls' lama)
// -------------------------------------------------------------
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }),
  employeeId: integer("employee_id").references(() => employees.id, {
    onDelete: "restrict",
  }),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollItems = pgTable("payroll_items", {
  id: serial("id").primaryKey(),
  payrollId: integer("payroll_id")
    .notNull()
    .references(() => payrolls.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  qty: integer("qty").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// -------------------------------------------------------------
// TABEL POTONG
// -------------------------------------------------------------
export const cuttingBatches = pgTable("cutting_batches", {
  id: serial("id").primaryKey(),
  batchCode: varchar("batch_code", { length: 50 }).notNull().unique(), // Contoh: BATCH-POTONG-20260501
  date: date("date").notNull(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

export const cuttingBatchItems = pgTable("cutting_batch_items", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => cuttingBatches.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "restrict" }),
  qtyInRoll: numeric("qty_in_roll", { precision: 10, scale: 2 }).notNull(),
  pricePerRoll: numeric("price_per_roll", {
    precision: 10,
    scale: 2,
  }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// -------------------------------------------------------------
// TABEL HARIAN
// -------------------------------------------------------------

// Tabel Header: Menyimpan informasi utama dari satu batch penggajian harian
export const dailyBatches = pgTable("daily_batches", {
  id: serial("id").primaryKey(),
  batchCode: varchar("batch_code", { length: 50 }).notNull().unique(), // Contoh: BATCH-HARIAN-20260501
  date: date("date").notNull(), // Tanggal absensi / kerja
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }), // Merekam admin yang menginput
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"), // Total keseluruhan pembayaran harian hari itu
});

// Tabel Child: Menyimpan rincian gaji, potongan, dan lembur per karyawan harian
export const dailyBatchItems = pgTable("daily_batch_items", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => dailyBatches.id, { onDelete: "cascade" }), // Jika header dihapus, item ikut terhapus
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "restrict" }), // Relasi ke karyawan
  status: varchar("status", { length: 20 }).notNull().default("hadir"), // Nilai: "hadir", "tidak hadir", "izin", dll.
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"), // Gaji pokok hari ini
  deduction: numeric("deduction", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"), // Potongan gaji (jika ada kasbon/telat)
  bonus: numeric("bonus", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"), // Gaji lembur atau tambahan
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"), // Hasil akhir (baseSalary - deduction + bonus)
  deductionReason: varchar("deduction_reason", { length: 255 }), // KOLOM BARU (Nullable)
  bonusReason: varchar("bonus_reason", { length: 255 }), // KOLOM BARU (Nullable)
});

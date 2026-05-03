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
import { relations } from "drizzle-orm";

// Fungsi utilitas untuk Waktu Jakarta (WIB)
const getJakartaTime = () => {
  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  return new Date(dateStr);
};

// ==========================================
// 1. USERS & EMPLOYEES (AUTH & HR CORE)
// ==========================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullname: varchar("fullname", { length: 100 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("karyawan"),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  jenis: varchar("jenis", { length: 20 }).default("borongan"),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

// ==========================================
// 2. PAYROLL MODULE (HR TRANSACTIONS)
// ==========================================

// MASTER: Produk Khusus Payroll
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

// TRANSAKSI: Jahit
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
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
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

// TRANSAKSI: Potong
export const cuttingBatches = pgTable("cutting_batches", {
  id: serial("id").primaryKey(),
  batchCode: varchar("batch_code", { length: 50 }).notNull().unique(),
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

  // --- PERUBAHAN DISINI ---
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(), // UPDATE: Ubah dari qtyInRoll ke qty (bisa desimal)
  unit: varchar("unit", { length: 20 }).notNull().default("roll"), // BARU: Menentukan satuan (pcs/roll)
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // UPDATE: Ubah dari pricePerRoll ke price

  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

// TRANSAKSI: Harian
export const dailyBatches = pgTable("daily_batches", {
  id: serial("id").primaryKey(),
  batchCode: varchar("batch_code", { length: 50 }).notNull().unique(),
  date: date("date").notNull(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

export const dailyBatchItems = pgTable("daily_batch_items", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => dailyBatches.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 20 }).notNull().default("hadir"),
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  deduction: numeric("deduction", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  bonus: numeric("bonus", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  deductionReason: varchar("deduction_reason", { length: 255 }),
  bonusReason: varchar("bonus_reason", { length: 255 }),
});

// ==========================================
// 3. WAREHOUSE & INVENTORY MODULE
// ==========================================

// MASTER: Atribut Fisik Gudang
export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const sizes = pgTable("sizes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 20 }).notNull(),
});

// MASTER: Produk Khusus Gudang (Induk dari varian)
export const warehouseProducts = pgTable("warehouse_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

// MASTER: Varian Produk (SKU Gudang Sesungguhnya)
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 100 }).notNull().unique(),
  warehouseProductId: integer("warehouse_product_id")
    .notNull()
    .references(() => warehouseProducts.id, { onDelete: "cascade" }),
  colorId: integer("color_id")
    .notNull()
    .references(() => colors.id, { onDelete: "restrict" }),
  sizeId: integer("size_id")
    .notNull()
    .references(() => sizes.id, { onDelete: "restrict" }),
  stock: integer("stock").notNull().default(0),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

// TRANSAKSI GUDANG: Production Output (Barang Masuk)
export const productionOutputs = pgTable("production_outputs", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  totalQty: integer("total_qty").notNull().default(0),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

export const productionOutputItems = pgTable("production_output_items", {
  id: serial("id").primaryKey(),
  headerId: integer("header_id")
    .notNull()
    .references(() => productionOutputs.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  qty: integer("qty").notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

// TRANSAKSI GUDANG: Sales (Barang Keluar)
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }) // Total Harga Jual
    .notNull()
    .default("0.00"),
  grandTotalCost: numeric("grand_total_cost", { precision: 12, scale: 2 }) // BARU: Total Harga Pokok / Modal
    .notNull()
    .default("0.00"),
  totalQty: integer("total_qty").notNull().default(0),
  marketplaceName: varchar("marketplace_name", { length: 100 }),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  headerId: integer("header_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  qty: integer("qty").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), // Harga Jual Satuan
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(), // Subtotal Harga Jual
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }) // BARU: Harga Modal Satuan
    .notNull()
    .default("0.00"),
  subtotalCost: numeric("subtotal_cost", { precision: 12, scale: 2 }) // BARU: Subtotal Harga Modal
    .notNull()
    .default("0.00"),
});

// TRANSAKSI GUDANG: Stock Adjustment (Penyesuaian Stok Opname)
export const stockAdjustments = pgTable("stock_adjustments", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  operatorId: integer("operator_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  totalQty: integer("total_qty").notNull().default(0),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  notes: varchar("notes", { length: 255 }), // BARU: Keterangan (Contoh: "Barang rusak kena air")
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

export const stockAdjustmentItems = pgTable("stock_adjustment_items", {
  id: serial("id").primaryKey(),
  headerId: integer("header_id")
    .notNull()
    .references(() => stockAdjustments.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  qty: integer("qty").notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});

// TRANSAKSI GUDANG: Buku Besar Stok (Mutasi / History)
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  type: varchar("type", { length: 50 }).notNull(),
  referenceId: integer("reference_id"),
  qty: integer("qty").notNull(),
  createdAt: timestamp("created_at").$defaultFn(getJakartaTime),
});

// ==========================================
// DRIZZLE RELATIONS
// ==========================================

// Relasi HR
export const payrollItemRelations = relations(payrollItems, ({ one }) => ({
  payroll: one(payrolls, {
    fields: [payrollItems.payrollId],
    references: [payrolls.id],
  }),
  product: one(products, {
    fields: [payrollItems.productId],
    references: [products.id],
  }),
}));

// Relasi Gudang
export const productVariantRelations = relations(
  productVariants,
  ({ one, many }) => ({
    warehouseProduct: one(warehouseProducts, {
      fields: [productVariants.warehouseProductId],
      references: [warehouseProducts.id],
    }),
    color: one(colors, {
      fields: [productVariants.colorId],
      references: [colors.id],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeId],
      references: [sizes.id],
    }),
    stockMovements: many(stockMovements),
  }),
);

export const warehouseProductRelations = relations(
  warehouseProducts,
  ({ many }) => ({
    variants: many(productVariants),
  }),
);

export const productionOutputRelations = relations(
  productionOutputs,
  ({ one, many }) => ({
    operator: one(users, {
      fields: [productionOutputs.operatorId],
      references: [users.id],
    }),
    items: many(productionOutputItems),
  }),
);

export const productionOutputItemRelations = relations(
  productionOutputItems,
  ({ one }) => ({
    header: one(productionOutputs, {
      fields: [productionOutputItems.headerId],
      references: [productionOutputs.id],
    }),
    variant: one(productVariants, {
      fields: [productionOutputItems.variantId],
      references: [productVariants.id],
    }),
  }),
);

export const salesRelations = relations(sales, ({ one, many }) => ({
  operator: one(users, {
    fields: [sales.operatorId],
    references: [users.id],
  }),
  items: many(saleItems),
}));

export const saleItemRelations = relations(saleItems, ({ one }) => ({
  header: one(sales, {
    fields: [saleItems.headerId],
    references: [sales.id],
  }),
  variant: one(productVariants, {
    fields: [saleItems.variantId],
    references: [productVariants.id],
  }),
}));

export const stockAdjustmentRelations = relations(
  stockAdjustments,
  ({ one, many }) => ({
    operator: one(users, {
      fields: [stockAdjustments.operatorId],
      references: [users.id],
    }),
    items: many(stockAdjustmentItems),
  }),
);

export const stockAdjustmentItemRelations = relations(
  stockAdjustmentItems,
  ({ one }) => ({
    header: one(stockAdjustments, {
      fields: [stockAdjustmentItems.headerId],
      references: [stockAdjustments.id],
    }),
    variant: one(productVariants, {
      fields: [stockAdjustmentItems.variantId],
      references: [productVariants.id],
    }),
  }),
);

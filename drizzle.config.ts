// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Membaca file .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/schema.ts", // Sesuaikan jika path file schema Anda berbeda
  out: "./drizzle", // Folder tempat menyimpan riwayat migrasi (opsional tapi disarankan)
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

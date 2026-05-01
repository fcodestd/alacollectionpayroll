// lib/actions/product.ts
"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq, ilike, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- 1. GET PRODUCTS ---
export async function getProducts(query: string, page: number) {
  const limit = 10;
  const offset = (page - 1) * limit;

  // Pencarian sekarang hanya berdasarkan nama (ilike name)
  const data = await db
    .select()
    .from(products)
    .where(ilike(products.name, `%${query}%`))
    .limit(limit)
    .offset(offset);

  const totalReq = await db
    .select({ value: count() })
    .from(products)
    .where(ilike(products.name, `%${query}%`));

  return { data, totalPages: Math.ceil(totalReq[0].value / limit) };
}

// --- 2. CREATE PRODUCT ---
export async function createProduct(values: any) {
  try {
    await db.insert(products).values({
      name: values.name,
      price: values.price, // Kolom numeric di Postgres bisa menerima string angka atau number
    });

    revalidatePath("/dashboard/master/products");
    return { success: true, message: "Produk berhasil ditambahkan" };
  } catch (e) {
    return { success: false, message: "Gagal menyimpan produk" };
  }
}

// --- 3. UPDATE PRODUCT ---
export async function updateProduct(id: number, values: any) {
  try {
    await db
      .update(products)
      .set({
        name: values.name,
        price: values.price,
      })
      .where(eq(products.id, id));

    revalidatePath("/dashboard/master/products");
    return { success: true, message: "Data produk berhasil diperbarui" };
  } catch (e) {
    return { success: false, message: "Gagal memperbarui produk" };
  }
}

// --- 4. DELETE PRODUCT ---
export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));

    revalidatePath("/dashboard/master/products");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (e) {
    // Menangani error jika produk tidak bisa dihapus karena relasi (onDelete: "restrict" dari payroll_items)
    return {
      success: false,
      message: "Gagal: Produk ini mungkin sedang digunakan pada data Payroll.",
    };
  }
}

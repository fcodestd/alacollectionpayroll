// lib/actions/user.ts
"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, ilike, or, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// --- 1. GET USERS (Read) ---
export async function getUsers(query: string, page: number) {
  const limit = 10;
  const offset = (page - 1) * limit;

  const data = await db
    .select()
    .from(users)
    .where(
      or(
        ilike(users.fullname, `%${query}%`),
        ilike(users.username, `%${query}%`),
      ),
    )
    .limit(limit)
    .offset(offset);

  const totalReq = await db
    .select({ value: count() })
    .from(users)
    .where(
      or(
        ilike(users.fullname, `%${query}%`),
        ilike(users.username, `%${query}%`),
      ),
    );

  return { data, totalPages: Math.ceil(totalReq[0].value / limit) };
}

// --- 2. CREATE USER (Create) ---
export async function createUser(values: any) {
  try {
    const hashedPassword = await bcrypt.hash(values.password, 10);
    await db.insert(users).values({
      fullname: values.fullname,
      username: values.username,
      role: values.role,
      password: hashedPassword,
    });

    revalidatePath("/dashboard/master/users");
    return { success: true, message: "User berhasil ditambahkan" };
  } catch (e) {
    return {
      success: false,
      message: "Gagal: Username mungkin sudah digunakan",
    };
  }
}

// --- 3. UPDATE USER (Update) ---
export async function updateUser(id: number, values: any) {
  try {
    // Siapkan data yang akan diupdate (kecuali password)
    const payload: any = {
      fullname: values.fullname,
      username: values.username,
      role: values.role,
    };

    // Cek apakah password diisi (tidak kosong)
    // Jika diisi, kita hash dan masukkan ke dalam payload update
    if (values.password && values.password.trim() !== "") {
      payload.password = await bcrypt.hash(values.password, 10);
    }

    // Eksekusi update berdasarkan ID
    await db.update(users).set(payload).where(eq(users.id, id));

    revalidatePath("/dashboard/master/users");
    return { success: true, message: "Profil user berhasil diperbarui" };
  } catch (e) {
    return {
      success: false,
      message: "Gagal: Username mungkin sudah digunakan",
    };
  }
}

// --- 4. DELETE USER (Delete) ---
export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/dashboard/master/users");
    return { success: true, message: "User berhasil dihapus" };
  } catch (e) {
    return { success: false, message: "Gagal menghapus user" };
  }
}

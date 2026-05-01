// lib/actions/profile.ts
"use server";

import { db } from "@/lib/db";
import { users, employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  userId: number,
  data: { fullname: string; username: string; password?: string },
) {
  try {
    const updateData: any = {
      fullname: data.fullname,
      username: data.username,
    };

    // Jika password diisi, hash password barunya
    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // 1. Update tabel users (Akun Login)
    await db.update(users).set(updateData).where(eq(users.id, userId));

    // 2. Update tabel employees (Data Fisik) agar namanya tersinkronisasi
    await db
      .update(employees)
      .set({ name: data.fullname })
      .where(eq(employees.userId, userId));

    revalidatePath("/employee/profile");
    revalidatePath("/employee");

    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error: any) {
    // Menangkap error jika username sudah dipakai orang lain (Unique Constraint)
    if (error.code === "23505" || error.message.includes("unique")) {
      return {
        success: false,
        message: "Username tersebut sudah digunakan orang lain!",
      };
    }
    console.error("Profile update error:", error);
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}

// app/api/seed/route.ts
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("owner987654321", 15)

    // 2. Masukkan ke database
    await db.insert(users).values({
      username: "owner",
      fullname: "Owner Ala Collection",
      password: hashedPassword,
      role: "owner",
    })

    return NextResponse.json({ message: "Sukses! Akun admin_utama berhasil dibuat." })
  } catch (error) {
    return NextResponse.json({ error: "Gagal atau akun sudah ada." }, { status: 500 })
  }
}
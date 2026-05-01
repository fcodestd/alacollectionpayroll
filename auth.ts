// auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import { eq } from "drizzle-orm";
import { users, employees } from "./lib/schema"; // Pastikan tabel employees di-import
import bcrypt from "bcryptjs";

// 1. AUGMENTASI TYPESCRIPT
// Menambahkan employeeId dan employeeJenis agar dikenali secara global oleh NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      employeeId?: string | null;
      employeeJenis?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    employeeId?: string | null;
    employeeJenis?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Akun Internal",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Cari data akun login di tabel users
        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username as string))
          .limit(1);

        const user = result[0];

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (isPasswordValid) {
          let employeeId = null;
          let employeeJenis = null;

          // 2. FETCH RELASI KARYAWAN
          // Jika yang login adalah karyawan, cari ID fisik karyawannya di tabel employees
          const roleLower = user.role?.toLowerCase() || "";
          if (roleLower === "karyawan" || roleLower === "employee") {
            const empResult = await db
              .select()
              .from(employees)
              // CATATAN: Pastikan nama kolom 'userId' sesuai dengan schema relasi Anda (bisa user_id atau userId)
              .where(eq(employees.userId, user.id))
              .limit(1);

            if (empResult.length > 0) {
              employeeId = empResult[0].id.toString();
              employeeJenis = empResult[0].jenis; // misal: 'borongan jahit', 'harian', dll
            }
          }

          return {
            id: user.id.toString(),
            name: user.fullname,
            role: user.role,
            employeeId,
            employeeJenis,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 3. TRANSFER KE TOKEN
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.employeeJenis = user.employeeJenis;
      }
      return token;
    },
    async session({ session, token }) {
      // 4. TRANSFER KE SESSION (Agar bisa dipakai di komponen UI)
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.employeeId = token.employeeId as string | null;
        session.user.employeeJenis = token.employeeJenis as string | null;
      }
      return session;
    },
  },
});

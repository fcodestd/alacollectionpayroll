// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import { eq } from "drizzle-orm";
import { users } from "./lib/schema";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // Mengarahkan user ke halaman ini jika belum login
  },
  providers: [
    Credentials({
      name: "Akun Internal",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Masukkan username",
        },
        password: { label: "Password", type: "password" },
      },
      // KEMBALIKAN parameter seperti semula, tanpa ': any'
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Tambahkan 'as string' di sini saat akan digunakan dalam query Drizzle
        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username as string))
          .limit(1);

        const user = result[0];

        if (!user || !user.password) {
          return null;
        }

        // Tambahkan 'as string' di sini untuk bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (isPasswordValid) {
          // 'as any' di sini tetap dipertahankan agar kita bisa mengirim properti 'role' kustom
          return {
            id: user.id.toString(),
            name: user.fullname,
            role: user.role,
          } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
  },
});

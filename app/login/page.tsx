// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  LogIn,
  AlertCircle,
  Scissors,
  User,
  Lock,
} from "lucide-react";
import Image from "next/image"; // Opsional: Untuk background pattern jika ada

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Username atau password salah!");
      setLoading(false);
    } else {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const userRole = session?.user?.role?.toLowerCase() || "";

      if (userRole === "karyawan" || userRole === "employee") {
        window.location.href = "/employee";
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      {/* SISI KIRI: Branding (Desktop Only) - Desain Premium */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 text-white flex-col justify-between p-14">
        {/* Ornamen Background / Glassmorphism */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Pola Opsional (Jika Anda punya gambar pattern) */}
        {/* <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none"></div> */}

        <div className="relative z-10 flex items-center gap-3 text-2xl font-bold tracking-tight">
        
          Ala Collection
        </div>

        <div className="relative z-10 space-y-6 max-w-lg mt-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-2">
            <span className="text-sm font-semibold tracking-wide text-blue-200 uppercase">
              Sistem Portal Pekerja
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] lg:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Kelola <br /> Operasional <br /> Lebih Cerdas.
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
            Platform terpadu untuk perhitungan akurat
            gaji karyawan borongan serta harian.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium mt-auto">
          © {new Date().getFullYear()} All Rights Reserved Dilindungi.
        </div>
      </div>

      {/* SISI KANAN: Area Form Login (Mobile & Desktop) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Ornamen Latar Mobile Only */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
          {/* Header Form Mobile & Desktop */}
          <div className="text-center mb-8">
         
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Masukkan kredensial Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Pesan Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Input Username dengan Ikon */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider"
                >
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-blue-600 focus-visible:border-blue-600 focus-visible:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Input Password dengan Ikon */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  {/* Opsional: Link Lupa Password jika ada fiturnya nanti */}
                  {/* <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Lupa sandi?</a> */}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-blue-600 focus-visible:border-blue-600 focus-visible:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Login */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base font-bold transition-all active:scale-[0.98] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/20 mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memasuki Sistem...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Masuk Sekarang
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

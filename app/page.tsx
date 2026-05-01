// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, AlertCircle, Scissors } from "lucide-react";

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
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Sisi Kiri: Branding (Otomatis hilang di layar HP) */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white lg:flex lg:w-3/5">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          Ala Collection
        </div>

        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight">
            Kelola operasional <br /> dengan lebih cerdas.
          </h1>
          <p className="text-lg text-slate-400">
            Platform untuk manajemen
            perhitungan akurat gaji karyawan borongan dan harian.
          </p>
        </div>

        <div className="text-sm text-slate-500 font-medium">
          © {new Date().getFullYear()} All Rights Reserved
        </div>
      </div>

      {/* Sisi Kanan: Area Form Login */}
      <div className="flex w-full items-center justify-center p-8 lg:w-2/5">
        <div className="w-full max-w-sm space-y-8">
          {/* Header Mobile (Muncul hanya di HP) */}
          <div className="flex items-center justify-center gap-2 lg:hidden mb-8">
            <div className="rounded-lg bg-slate-900 p-2">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ala Collection
            </span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-500">
              Masukkan kredensial Anda untuk masuk ke panel sistem.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 px-4 shadow-sm focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 px-4 shadow-sm focus-visible:ring-blue-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium shadow-md transition-all hover:-translate-y-0.5 bg-slate-900 hover:bg-slate-800"
              disabled={loading}
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

// app/employee/profile/profile-client.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Loader2,
  Save,
  Lock,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  AtSign,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/profile";

export default function ProfileClient({
  user,
  employee,
}: {
  user: any;
  employee: any;
}) {
  const [fullname, setFullname] = useState(user.fullname || "");
  const [username, setUsername] = useState(user.username || "");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await updateProfile(user.id, {
      fullname,
      username,
      password,
    });

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setPassword("");
    } else {
      setMessage({ type: "error", text: result.message });
    }

    setIsLoading(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login", redirect: true });
  };

  // Mengambil inisial nama untuk Avatar (Misal: Budi Santoso -> BS)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* HEADER PROFIL - Desain Elegan & Melengkung */}
      <div className="bg-slate-900 rounded-b-[2.5rem] p-8 pt-14 text-white shadow-xl text-center relative overflow-hidden">
        {/* Ornamen Latar */}
        <div className="absolute top-[-20%] left-[-10%] h-40 w-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-32 w-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar Inisial */}
          <div className="h-24 w-24 bg-white/10 p-1.5 rounded-full backdrop-blur-md border border-white/20 mb-5 shadow-inner">
            <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black tracking-widest shadow-md">
              {getInitials(fullname || "User")}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            {fullname}
          </h1>

          <div className="flex items-center gap-2 mt-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50 shadow-sm">
            <Briefcase className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200 capitalize tracking-wide">
              {employee?.jenis || "Belum ada jabatan"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6 -mt-6 relative z-20">
        {/* KARTU FORM UPDATE PROFIL */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pengaturan Akun
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Perbarui identitas dan akses Anda
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 mb-6 text-sm transition-all ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <p className="font-semibold leading-relaxed">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Input Nama Lengkap (Sejajar dengan Ikon) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white transition-all shadow-sm"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            {/* Input Username (Sejajar dengan Ikon) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
                Username Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white transition-all shadow-sm"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            {/* Input Password Baru (Sejajar dengan Ikon) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider flex justify-between">
                <span>Password Baru</span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">
                  *Opsional
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah"
                  className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-600/20 mt-8 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" /> Menyimpan
                  Data...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" /> Simpan Perubahan
                </>
              )}
            </Button>
          </form>
        </div>

        {/* KARTU LOGOUT */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="text-center mb-6">
            <p className="text-xs text-slate-500 font-medium mt-1">
              Logout dari sistem.
            </p>
          </div>

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            className="w-full h-14 rounded-2xl font-bold text-base bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none transition-all active:scale-[0.98]"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" /> Sedang
                Keluar...
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5 mr-2" /> Keluar (Logout)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

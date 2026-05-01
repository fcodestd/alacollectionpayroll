// app/employee/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none print:hidden">
      <div className="w-full max-w-md bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pointer-events-auto pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/employee"
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${pathname === "/employee" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Home
              className={`h-5 w-5 ${pathname === "/employee" ? "fill-blue-100" : ""}`}
            />
            <span className="text-[10px] font-semibold tracking-wide">
              Home
            </span>
          </Link>

          <Link
            href="/employee/profile"
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${pathname === "/employee/profile" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <User
              className={`h-5 w-5 ${pathname === "/employee/profile" ? "fill-blue-100" : ""}`}
            />
            <span className="text-[10px] font-semibold tracking-wide">
              Profile
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

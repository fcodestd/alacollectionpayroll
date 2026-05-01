// components/admin-navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Database,
  Banknote,
  FileText,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Scissors,
  UserCircle,
} from "lucide-react";

// Struktur Menu Dinamis Utama
const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Master Data",
    icon: Database,
    submenu: [
      { title: "Users", href: "/dashboard/master/users" },
      { title: "Karyawan", href: "/dashboard/master/employees" },
      { title: "Product", href: "/dashboard/master/products" },
    ],
  },
  {
    title: "Payroll",
    icon: Banknote,
    submenu: [
      { title: "Input Borongan Jahit", href: "/dashboard/payroll/borongan/jahit" },
      { title: "Input Borongan Cutting", href: "/dashboard/payroll/borongan/cutting" },
      { title: "Input Harian", href: "/dashboard/payroll/harian" },
      {
        title: "Riwayat Input",
        href: "/dashboard/payroll/riwayat",
      },
    ],
  },
  {
    title: "Rekap",
    icon: FileText,
    submenu: [
      { title: "Rekap Jahit", href: "/dashboard/rekap/jahit" },
      { title: "Rekap Cutting", href: "/dashboard/rekap/cutting" },
      { title: "Rekap Harian", href: "/dashboard/rekap/harian" },
    ],
  },
];

export default function AdminNavbar({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // LOGIKA PROTEKSI MENU: Filter menu berdasarkan role pengguna
  const visibleMenuItems = menuItems.filter((menu) => {
    // Sembunyikan "Master Data" jika role bukan "owner"
    if (menu.title === "Master Data" && user?.role !== "owner") {
      return false;
    }
    return true;
  });

  return (
    <nav className="bg-slate-900 text-slate-100 shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Ala Collection
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {/* GUNAKAN visibleMenuItems DI SINI */}
              {visibleMenuItems.map((menu, index) => (
                <div key={index} className="relative group">
                  {menu.href ? (
                    <Link
                      href={menu.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white ${
                        pathname === menu.href
                          ? "bg-slate-800 text-white"
                          : "text-slate-300"
                      }`}
                    >
                      <menu.icon className="h-4 w-4" />
                      {menu.title}
                    </Link>
                  ) : (
                    <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                      <menu.icon className="h-4 w-4" />
                      {menu.title}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                  )}

                  {/* Dropdown Menu Desktop */}
                  {menu.submenu && (
                    <div className="absolute left-0 z-10 mt-0 hidden w-48 origin-top-left flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:flex">
                      {menu.submenu.map((sub, subIdx) => (
                        <Link
                          key={subIdx}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Profil Desktop & Tombol Toggle Mobile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex md:items-center md:gap-4 border-l border-slate-700 pl-4">
              <div className="text-right">
                <div className="text-sm font-medium leading-none text-white">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-400 mt-1 uppercase">
                  {user?.role}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-3"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Hamburger Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 pb-3 pt-2">
          <div className="space-y-1 px-2 sm:px-3">
            {/* GUNAKAN visibleMenuItems DI SINI JUGA */}
            {visibleMenuItems.map((menu, index) => (
              <div key={index}>
                {menu.href ? (
                  <Link
                    href={menu.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {menu.title}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-slate-400">
                      {menu.title}
                    </div>
                    <div className="pl-6 space-y-1">
                      {menu.submenu?.map((sub, subIdx) => (
                        <Link
                          key={subIdx}
                          href={sub.href}
                          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 border-t border-slate-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <UserCircle className="h-8 w-8 text-slate-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">
                    {user?.name}
                  </div>
                  <div className="text-sm font-medium leading-none text-slate-400 mt-1 uppercase">
                    {user?.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// components/dashboard-filter.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DashboardFilter({
  selectedMonth,
  selectedYear,
}: {
  selectedMonth: string;
  selectedYear: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (name: string, value: string) => {
    // Membuat salinan parameter yang ada sekarang
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);

    // Melakukan push ke URL tanpa refresh halaman
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedMonth}
        onChange={(e) => handleFilterChange("month", e.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer hover:bg-slate-50"
      >
        <option value="01">Januari</option>
        <option value="02">Februari</option>
        <option value="03">Maret</option>
        <option value="04">April</option>
        <option value="05">Mei</option>
        <option value="06">Juni</option>
        <option value="07">Juli</option>
        <option value="08">Agustus</option>
        <option value="09">September</option>
        <option value="10">Oktober</option>
        <option value="11">November</option>
        <option value="12">Desember</option>
      </select>

      <select
        value={selectedYear}
        onChange={(e) => handleFilterChange("year", e.target.value)}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer hover:bg-slate-50"
      >
        <option value="2025">2025</option>
        <option value="2026">2026</option>
        <option value="2027">2027</option>
      </select>
    </div>
  );
}

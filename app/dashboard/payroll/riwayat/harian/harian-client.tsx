// app/dashboard/payroll/riwayat/harian/harian-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSignature,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
const formatDate = (d: any) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const formatDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const getLast7Days = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return { start: formatDateStr(start), end: formatDateStr(end) };
};

export default function HarianRiwayatClient({
  initialData,
  totalPages,
  currentPage,
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterMonth, setFilterMonth] = useState("");
  const [is7Days, setIs7Days] = useState(
    !searchParams.get("start") && !searchParams.get("end"),
  );

  useEffect(() => {
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    if (start && end && start.substring(0, 7) === end.substring(0, 7)) {
      setFilterMonth(start.substring(0, 7));
      setIs7Days(false);
    } else if (start && end) {
      setIs7Days(false);
    }
  }, [searchParams]);

  const applyFilters = (startDate: string, endDate: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSet7Days = () => {
    const { start, end } = getLast7Days();
    setFilterMonth("");
    setIs7Days(true);
    applyFilters(start, end);
  };

  const handleMonthChange = (e: any) => {
    const val = e.target.value;
    setFilterMonth(val);
    setIs7Days(false);
    if (val) {
      const [year, month] = val.split("-");
      const lastDay = new Date(Number(year), Number(month), 0);
      applyFilters(
        `${year}-${month}-01`,
        `${year}-${month}-${lastDay.getDate().toString().padStart(2, "0")}`,
      );
    } else {
      applyFilters("", "");
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <Button
            variant={is7Days ? "default" : "outline"}
            onClick={handleSet7Days}
            size="sm"
            className={is7Days ? "bg-slate-900 text-white" : "bg-white"}
          >
            7 Hari Terakhir
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <Input
              type="month"
              value={filterMonth}
              onChange={handleMonthChange}
              className="w-40 bg-white h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <Table className="flex-1">
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="pl-6 h-12">Tanggal</TableHead>
              <TableHead>Batch Code</TableHead>
              <TableHead>Operator Admin</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead className="text-center pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((item: any) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="pl-6 py-4 font-medium text-slate-700">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell className="py-4">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">
                    {item.code}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm text-slate-500 font-medium">
                  {item.operatorName}
                </TableCell>
                <TableCell className="py-4 text-right font-black text-emerald-700 text-base">
                  {formatRp(item.grandTotal)}
                </TableCell>
                <TableCell className="py-4 pr-6 text-center">
                  {/* Pindah ke Halaman Detail Harian */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/payroll/riwayat/harian/${item.id}`,
                      )
                    }
                    className="shadow-sm font-semibold border-slate-200 hover:bg-slate-100"
                  >
                    <Eye className="h-4 w-4 mr-1.5 text-slate-500" /> Buka Batch
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {initialData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center text-slate-400">
                    <FileSignature className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-slate-600">
                      Data tidak ditemukan.
                    </p>
                    <p className="text-xs mt-1">Ubah filter tanggal di atas.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-500">
            Halaman{" "}
            <span className="font-bold text-slate-900">{currentPage}</span> dari{" "}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="bg-white shadow-sm border-slate-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="bg-white shadow-sm border-slate-200"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

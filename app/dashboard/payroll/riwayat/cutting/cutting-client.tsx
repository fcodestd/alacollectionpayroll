"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function CuttingRiwayatClient({
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
    } else if (start && end) setIs7Days(false);
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
    } else applyFilters("", "");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
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
                <TableCell className="pl-6 py-4 font-medium">
                  {formatDate(item.date)}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {item.code}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {item.operatorName}
                </TableCell>
                <TableCell className="text-right font-black text-indigo-700">
                  {formatRp(item.grandTotal)}
                </TableCell>
                <TableCell className="text-center pr-6">
                  {/* Pindah ke Halaman Detail yang sebelumnya sudah kita buat */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/payroll/riwayat/cutting/${item.id}`,
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-1.5 text-slate-500" /> Buka Batch
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

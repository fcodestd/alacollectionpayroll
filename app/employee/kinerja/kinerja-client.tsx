"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Eye,
  Inbox,
  Scissors,
  FileSignature,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Import Server Actions
import {
  getPayrollReport,
  getCuttingReport,
  getDailyReport,
} from "@/lib/actions/report";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

// Helper Waktu Khusus WIB (Asia/Jakarta)
const getJakartaDate = () => {
  const dateStr = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  return new Date(dateStr);
};

const getThisWeek = () => {
  const curr = getJakartaDate(); // UPDATE: Menggunakan waktu WIB
  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(curr);
  start.setDate(curr.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: format(start), end: format(end) };
};

export default function KinerjaClient({ employee }: { employee: any }) {
  const router = useRouter();
  const thisWeekDates = getThisWeek();

  const [startDate, setStartDate] = useState(thisWeekDates.start);
  const [endDate, setEndDate] = useState(thisWeekDates.end);
  const [filterMonth, setFilterMonth] = useState("");
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // State Modal khusus Jahit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateData, setSelectedDateData] = useState<{
    date: string;
    items: any;
  } | null>(null);

  const jenis = employee.jenis.toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let result = {};
      try {
        if (jenis.includes("jahit"))
          result = await getPayrollReport(employee.id, startDate, endDate);
        else if (jenis.includes("potong"))
          result = await getCuttingReport(employee.id, startDate, endDate);
        else if (jenis.includes("harian"))
          result = await getDailyReport(employee.id, startDate, endDate);
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
      setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, [startDate, endDate, employee.id, jenis]);

  const setWeekMode = () => {
    setFilterMonth("");
    setStartDate(thisWeekDates.start);
    setEndDate(thisWeekDates.end);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterMonth(val);
    if (val) {
      const [year, month] = val.split("-");
      const lastDay = new Date(Number(year), Number(month), 0);
      setStartDate(`${year}-${month}-01`);
      setEndDate(
        `${year}-${month}-${lastDay.getDate().toString().padStart(2, "0")}`,
      );
    }
  };

  const generateDateRange = () => {
    const dates = [];
    let current = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const calendarDays = generateDateRange();

  // ICON BERDASARKAN JENIS
  const getIcon = () => {
    if (jenis.includes("jahit"))
      return <Shirt className="h-5 w-5 text-blue-600" />;
    if (jenis.includes("potong"))
      return <Scissors className="h-5 w-5 text-indigo-600" />;
    return <FileSignature className="h-5 w-5 text-emerald-600" />;
  };

  return (
    <>
      {/* HEADER STICKY UNTUK MOBILE */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/employee")}
            className="rounded-full h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Kinerja Saya
            </h1>
            <p className="text-xs text-slate-500 capitalize">
              {employee.jenis}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>

        {/* FILTER BAR MOBILE FRIENDLY */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filterMonth === "" ? "default" : "outline"}
            onClick={setWeekMode}
            className={`rounded-full px-4 text-xs ${filterMonth === "" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            Minggu Ini
          </Button>
          <div className="flex-1 relative">
            <Input
              type="month"
              value={filterMonth}
              onChange={handleMonthChange}
              className="h-8 text-xs rounded-full bg-white pr-8"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* LIST KARTU KINERJA */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600" />
            <p className="text-sm font-medium">Memuat data kinerja...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calendarDays.map((dateObj) => {
              const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
              const dayData = data[dateStr];

              // Render Kosong
              if (!dayData) {
                return (
                  <div
                    key={dateStr}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center opacity-70"
                  >
                    <div className="w-14 text-center border-r border-slate-200 pr-4 shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-lg font-black text-slate-400">
                        {dateObj.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 pl-4 flex items-center gap-2 text-slate-400">
                      <Inbox className="h-4 w-4" />
                      <p className="text-sm font-medium">Libur / Kosong</p>
                    </div>
                  </div>
                );
              }

              // RENDER KARTU: JAHIT
              if (jenis.includes("jahit")) {
                let totalPcs = 0;
                let totalRp = 0;
                Object.values(dayData).forEach((detail: any) => {
                  totalPcs += detail.qty;
                  totalRp += detail.subtotal;
                });
                return (
                  <div
                    key={dateStr}
                    className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center hover:border-blue-300 transition-colors"
                  >
                    <div className="w-14 text-center border-r border-slate-100 pr-4 shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {dateObj.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 pl-4">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Total Jahitan:{" "}
                        <span className="font-bold text-slate-800">
                          {totalPcs} Pcs
                        </span>
                      </p>
                      <p className="text-lg font-bold text-blue-700">
                        {formatRp(totalRp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-blue-600 bg-blue-50 rounded-full shrink-0 ml-2"
                      onClick={() => {
                        setSelectedDateData({ date: dateStr, items: dayData });
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                );
              }

              // RENDER KARTU: POTONG
              if (jenis.includes("potong")) {
                return (
                  <div
                    key={dateStr}
                    className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex items-center"
                  >
                    <div className="w-14 text-center border-r border-slate-100 pr-4 shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {dateObj.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 pl-4 flex justify-between items-center">
                      <div>
                        {/* UPDATE: Memunculkan Pcs/Roll secara dinamis */}
                        <p className="text-xs font-semibold text-slate-600 capitalize">
                          {dayData.qty} {dayData.unit || "Roll"} &times;{" "}
                          {formatRp(dayData.price)}
                        </p>
                        <p className="text-lg font-bold text-indigo-700 mt-0.5">
                          {formatRp(dayData.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // RENDER KARTU: HARIAN
              if (jenis.includes("harian")) {
                const isHadir = dayData.status === "hadir";
                if (!isHadir)
                  return (
                    <div
                      key={dateStr}
                      className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center"
                    >
                      <div className="w-14 text-center border-r border-red-200/50 pr-4 shrink-0">
                        <p className="text-[10px] font-bold text-red-400 uppercase">
                          {dateObj.toLocaleDateString("id-ID", {
                            weekday: "short",
                          })}
                        </p>
                        <p className="text-lg font-black text-red-500">
                          {dateObj.getDate()}
                        </p>
                      </div>
                      <div className="flex-1 pl-4">
                        <p className="text-sm font-bold text-red-600">
                          Tidak Hadir (Alpa/Izin)
                        </p>
                      </div>
                    </div>
                  );
                return (
                  <div
                    key={dateStr}
                    className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm flex items-center"
                  >
                    <div className="w-14 text-center border-r border-slate-100 pr-4 shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        {dateObj.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 pl-4 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Pokok:</span>
                        <span className="font-semibold">
                          {formatRp(dayData.baseSalary)}
                        </span>
                      </div>
                      {dayData.bonus > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span className="truncate w-24">
                            +{dayData.bonusReason}
                          </span>
                          <span className="font-medium">
                            {formatRp(dayData.bonus)}
                          </span>
                        </div>
                      )}
                      {dayData.deduction > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span className="truncate w-24">
                            -{dayData.deductionReason}
                          </span>
                          <span className="font-medium">
                            {formatRp(dayData.deduction)}
                          </span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-slate-100 flex justify-between items-center mt-1">
                        <span className="font-bold text-emerald-800">
                          Total:
                        </span>
                        <span className="text-sm font-black text-emerald-700">
                          {formatRp(dayData.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET / MODAL UNTUK JAHIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[90vw] max-w-md p-0 overflow-hidden rounded-3xl gap-0 border-none shadow-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 text-center">
            <DialogTitle className="text-white text-lg font-bold">
              Detail Jahitan
            </DialogTitle>
            <p className="text-blue-300 text-sm mt-1">
              {selectedDateData
                ? new Date(selectedDateData.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>

          <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {selectedDateData &&
                Object.entries(selectedDateData.items).map(
                  ([pName, detail]: [string, any], idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {pName}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Tarif: {formatRp(detail.price)} ×{" "}
                          <span className="font-bold text-slate-700">
                            {detail.qty} Pcs
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700">
                          {formatRp(detail.subtotal)}
                        </p>
                      </div>
                    </div>
                  ),
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-slate-600 text-sm">
                Total Tanggal Ini
              </span>
              <span className="text-xl font-black text-slate-900">
                {selectedDateData
                  ? formatRp(
                      Object.values(selectedDateData.items).reduce(
                        (a: number, c: any) => a + c.subtotal,
                        0,
                      ),
                    )
                  : 0}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

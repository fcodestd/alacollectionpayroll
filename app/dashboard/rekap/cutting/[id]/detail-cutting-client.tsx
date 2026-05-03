"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Printer,
  Loader2,
  ArrowLeft,
  Inbox,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCuttingReport } from "@/lib/actions/report";
import SlipPotongPrint from "@/components/print/slip-potong";

const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

const getThisWeek = () => {
  const curr = new Date();
  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(curr);
  start.setDate(curr.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: formatDateStr(start), end: formatDateStr(end) };
};

export default function DetailPotongClientPage({
  employee,
}: {
  employee: any;
}) {
  const router = useRouter();
  const thisWeekDates = getThisWeek();

  // State UI
  const [startDate, setStartDate] = useState(thisWeekDates.start);
  const [endDate, setEndDate] = useState(thisWeekDates.end);
  const [filterMonth, setFilterMonth] = useState("");

  // UPDATE: Menambahkan `unit?: string` pada tipe State
  const [data, setData] = useState<
    Record<
      string,
      { qty: number; unit?: string; price: number; subtotal: number }
    >
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // State PRINT (Terkunci ke 7 Hari Terakhir)
  const [printData, setPrintData] = useState<Record<string, any>>({});
  const [isPrintReady, setIsPrintReady] = useState(false);

  useEffect(() => {
    const fetchUIData = async () => {
      setIsLoading(true);
      const result = await getCuttingReport(employee.id, startDate, endDate);
      setData(result);
      setIsLoading(false);
    };
    fetchUIData();
  }, [startDate, endDate, employee.id]);

  useEffect(() => {
    const fetchPrintData = async () => {
      const result = await getCuttingReport(
        employee.id,
        thisWeekDates.start,
        thisWeekDates.end,
      );
      setPrintData(result);
      setIsPrintReady(true);
    };
    fetchPrintData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id]);

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

  const handlePrint = () => {
    if (isPrintReady) window.print();
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

  return (
    <>
      <div className="print:hidden space-y-6 animate-in fade-in duration-300 pb-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/dashboard/rekap/cutting")}
              className="rounded-full mt-1 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {employee.name}
              </h1>
              <Badge
                variant="secondary"
                className="mt-1 capitalize bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                <Scissors className="h-3 w-3 mr-1 inline" /> {employee.jenis}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Button
              variant={filterMonth === "" ? "default" : "outline"}
              onClick={setWeekMode}
              className={
                filterMonth === "" ? "bg-slate-900 text-white" : "bg-white"
              }
            >
              Minggu Ini
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <Input
                type="month"
                value={filterMonth}
                onChange={handleMonthChange}
                className="w-40 bg-white h-9"
              />
            </div>
            <Button
              onClick={handlePrint}
              disabled={!isPrintReady}
              className="bg-indigo-600 hover:bg-indigo-700 text-white ml-2 shadow-sm gap-2"
            >
              {isPrintReady ? (
                <Printer className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}{" "}
              Cetak Slip (7 Hari Terakhir)
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Rincian Pemotongan{" "}
            <span className="text-sm font-normal text-slate-500">
              ({startDate} s/d {endDate})
            </span>
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Merekap data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {calendarDays.map((dateObj) => {
                const dateStr = formatDateStr(dateObj);
                const dayData = data[dateStr];

                return (
                  <div
                    key={dateStr}
                    className={`border rounded-xl p-4 flex flex-col transition-all ${dayData ? "bg-indigo-50/30 border-indigo-200 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-75"}`}
                  >
                    <div className="border-b pb-2 mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        {dateObj.toLocaleDateString("id-ID", {
                          weekday: "long",
                        })}
                      </p>
                      <h3 className="font-bold text-slate-900">
                        {dateObj.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </h3>
                    </div>
                    {dayData ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {/* UPDATE: Memunculkan Pcs/Roll secara Dinamis dan menggunakan class 'capitalize' */}
                        <p className="text-sm font-semibold text-slate-600 mb-1 tracking-tight capitalize">
                          {dayData.qty} {dayData.unit || "Roll"} &times;{" "}
                          {formatRp(dayData.price)}
                        </p>
                        <p className="text-xl font-black text-indigo-700">
                          {formatRp(dayData.subtotal)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-4">
                        <Inbox className="h-6 w-6 mb-2 opacity-20" />
                        <p className="text-xs font-medium text-center">
                          Tidak ada data
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SlipPotongPrint
        employee={employee}
        data={printData}
        startDate={thisWeekDates.start}
        endDate={thisWeekDates.end}
      />
    </>
  );
}

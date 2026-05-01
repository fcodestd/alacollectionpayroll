"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Printer,
  Loader2,
  ArrowLeft,
  Eye,
  Inbox,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getPayrollReport } from "@/lib/actions/report";
import SlipGajiPrint from "@/components/print/slip-gaji";

const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Pastikan selalu mendapat Senin - Minggu minggu ini
const getThisWeek = () => {
  const curr = new Date();
  const day = curr.getDay(); // 0 = Minggu
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(curr);
  start.setDate(curr.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: formatDateStr(start), end: formatDateStr(end) };
};

export default function DetailJahitClientPage({ employee }: { employee: any }) {
  const router = useRouter();
  const thisWeekDates = getThisWeek();

  // State untuk UI Layar
  const [startDate, setStartDate] = useState(thisWeekDates.start);
  const [endDate, setEndDate] = useState(thisWeekDates.end);
  const [filterMonth, setFilterMonth] = useState("");
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // State KHUSUS untuk PRINT (Selalu menggunakan thisWeekDates)
  const [printData, setPrintData] = useState<Record<string, any>>({});
  const [isPrintReady, setIsPrintReady] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateData, setSelectedDateData] = useState<{
    date: string;
    items: any;
  } | null>(null);

  // 1. Fetch data untuk Tampilan Layar (Bisa berubah sesuai filter)
  useEffect(() => {
    const fetchUIData = async () => {
      setIsLoading(true);
      const result = await getPayrollReport(employee.id, startDate, endDate);
      setData(result);
      setIsLoading(false);
    };
    fetchUIData();
  }, [startDate, endDate, employee.id]);

  // 2. Fetch data KHUSUS untuk Cetak PDF (Dikunci di Minggu Ini)
  useEffect(() => {
    const fetchPrintData = async () => {
      const result = await getPayrollReport(
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
    if (!isPrintReady) return;
    window.print();
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
              onClick={() => router.push("/dashboard/rekap/jahit")}
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
                className="mt-1 capitalize bg-blue-50 text-blue-700 border-blue-200"
              >
                <Shirt className="h-3 w-3 mr-1 inline" /> {employee.jenis}
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
            {/* Tombol Cetak PDF */}
            <Button
              onClick={handlePrint}
              disabled={!isPrintReady}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-2 shadow-sm gap-2"
            >
              {isPrintReady ? (
                <Printer className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Cetak Slip (7 Hari Terakhir)
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 min-h-[400px]">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Rincian Kinerja Penjahit
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

                let totalPcs = 0;
                let totalRp = 0;
                if (dayData) {
                  Object.values(dayData).forEach((detail: any) => {
                    totalPcs += detail.qty;
                    totalRp += detail.subtotal;
                  });
                }

                return (
                  <div
                    key={dateStr}
                    className={`border rounded-xl p-4 flex flex-col transition-all ${dayData ? "bg-blue-50/30 border-blue-200 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-75"}`}
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
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1 mb-4">
                          <p className="text-sm font-medium text-slate-700">
                            Total:{" "}
                            <span className="font-bold">{totalPcs} Pcs</span>
                          </p>
                          <p className="text-sm font-bold text-blue-700">
                            Rp {totalRp.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedDateData({
                              date: dateStr,
                              items: dayData,
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Lihat Hasil
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-4">
                        <Inbox className="h-6 w-6 mb-2 opacity-20" />
                        <p className="text-xs font-medium text-center">
                          Tidak ada jahitan
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" /> Detail Pekerjaan
              Jahit
            </DialogTitle>
            <p className="text-slate-400 text-sm mt-1">
              Tanggal:{" "}
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
          <div className="p-6 bg-slate-50">
            <div className="space-y-3">
              {selectedDateData &&
                Object.entries(selectedDateData.items).map(
                  ([pName, detail]: [string, any], idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{pName}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Tarif: Rp {detail.price.toLocaleString("id-ID")} ×{" "}
                          <span className="font-bold text-slate-700">
                            {detail.qty} Pcs
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700 tracking-tight">
                          Rp {detail.subtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ),
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center px-1">
              <span className="font-semibold text-slate-600">
                Total Upah Jahit
              </span>
              <span className="text-xl font-bold text-slate-900">
                Rp{" "}
                {selectedDateData
                  ? Object.values(selectedDateData.items)
                      .reduce((a: number, c: any) => a + c.subtotal, 0)
                      .toLocaleString("id-ID")
                  : 0}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TAMPILAN PRINT PDF MENGGUNAKAN DATA KHUSUS (printData & thisWeekDates) */}
      <SlipGajiPrint
        employee={employee}
        data={printData} // Menggunakan printData yang sudah dikunci
        startDate={thisWeekDates.start} // Menggunakan kunci thisWeekDates
        endDate={thisWeekDates.end}
        is7Days={true} // Selalu true
      />
    </>
  );
}

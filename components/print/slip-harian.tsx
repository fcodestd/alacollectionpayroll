"use client";
import React from "react";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
const namaHari = [
  "MINGGU",
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
  "SABTU",
];
const namaBulan = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getLocalYMD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDatePrint(dateObj: Date) {
  return `${dateObj.getDate().toString().padStart(2, "0")} ${namaBulan[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

export default function SlipHarianPrint({
  employee,
  data,
  startDate,
  endDate,
}: {
  employee: any;
  data: Record<string, any>;
  startDate: string;
  endDate: string;
}) {
  const startD = new Date(`${startDate}T00:00:00`);
  const endD = new Date(`${endDate}T00:00:00`);

  const startDayIndex = startD.getDay();
  const diffToMonday = startDayIndex === 0 ? 6 : startDayIndex - 1;
  const endDayIndex = endD.getDay();
  const diffToSunday = endDayIndex === 0 ? 0 : 7 - endDayIndex;

  const calendarStart = new Date(startD);
  calendarStart.setDate(startD.getDate() - diffToMonday);
  const calendarEnd = new Date(endD);
  calendarEnd.setDate(endD.getDate() + diffToSunday);

  const daysArray: Date[] = [];
  let currentD = new Date(calendarStart);
  while (currentD <= calendarEnd) {
    daysArray.push(new Date(currentD));
    currentD.setDate(currentD.getDate() + 1);
  }

  const chunks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    chunks.push(daysArray.slice(i, i + 7));
  }

  let globalGrandTotal = 0;

  return (
    <div
      className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[99999] text-black bg-white"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="w-full max-w-[1200px] mx-auto p-4 pt-8">
        {/* HEADER PERUSAHAAN */}
        <div className="flex justify-between items-end border-b-4 border-emerald-900 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
              ALA COLLECTION
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Konveksi & Pakaian Anak dan Wanita
            </p>
            <p className="text-sm text-gray-500">
              Jl Panca Tengah Kec. Batujajar Kab. Bandung Barat 40561
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">
              SLIP GAJI HARIAN
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Dicetak pada: {formatDatePrint(new Date())},{" "}
              {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* INFO KARYAWAN */}
        <div className="flex justify-between mb-8">
          <div className="space-y-3">
            <div className="flex">
              <span className="w-40 font-semibold text-gray-700">
                Nama Karyawan
              </span>
              <span className="font-bold uppercase">: {employee.name}</span>
            </div>
            <div className="flex">
              <span className="w-40 font-semibold text-gray-700">
                Status Pekerja
              </span>
              <span className="capitalize">: {employee.jenis}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">
                Periode Kerja
              </span>
              <span>: 7 Hari Terakhir</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">
                Tanggal Awal
              </span>
              <span>: {formatDatePrint(startD)}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">
                Tanggal Akhir
              </span>
              <span>: {formatDatePrint(endD)}</span>
            </div>
          </div>
        </div>

        {/* TABEL 7 HARI MINGGUAN */}
        {chunks.map((week, index) => {
          return (
            <div key={index} className="mb-6 page-break-inside-avoid">
              <table className="w-full border-collapse border border-emerald-200">
                <thead>
                  <tr className="bg-slate-50">
                    {week.map((day, idx) => (
                      <th
                        key={idx}
                        className="border border-emerald-200 p-2 text-center w-[14.28%]"
                      >
                        <div className="font-bold text-gray-900">
                          {namaHari[day.getDay()]}
                        </div>
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                          {formatDatePrint(day)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {week.map((day, idx) => {
                      const dateStr = getLocalYMD(day);
                      const dayData = data[dateStr];
                      const isOutsidePeriod = day < startD || day > endD;

                      if (!isOutsidePeriod && dayData?.status === "hadir") {
                        globalGrandTotal += dayData.subtotal;
                      }

                      return (
                        <td
                          key={idx}
                          className={`border border-emerald-200 align-top p-0 h-40 ${isOutsidePeriod ? "bg-gray-50/50" : ""}`}
                        >
                          {isOutsidePeriod ? (
                            <div className="h-full w-full flex items-center justify-center text-gray-300 italic text-[10px]">
                              Luar Periode
                            </div>
                          ) : dayData ? (
                            dayData.status === "hadir" ? (
                              <div className="h-full flex flex-col justify-between p-2 text-[10px] bg-emerald-50/10">
                                <div className="space-y-1">
                                  {/* Gaji Pokok */}
                                  <div className="flex justify-between border-b border-gray-200 pb-1">
                                    <span className="text-gray-600">
                                      Gaji Pokok:
                                    </span>
                                    <span className="font-bold text-gray-800">
                                      {formatRp(dayData.baseSalary)}
                                    </span>
                                  </div>

                                  {/* Tambahan */}
                                  {dayData.bonus > 0 && (
                                    <div className="flex justify-between text-blue-600 pt-0.5">
                                      <span
                                        className="truncate w-14"
                                        title={dayData.bonusReason}
                                      >
                                        +{dayData.bonusReason || "Bonus"}
                                      </span>
                                      <span className="font-semibold">
                                        {formatRp(dayData.bonus)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Potongan */}
                                  {dayData.deduction > 0 && (
                                    <div className="flex justify-between text-red-600 pt-0.5">
                                      <span
                                        className="truncate w-14"
                                        title={dayData.deductionReason}
                                      >
                                        -{dayData.deductionReason || "Potong"}
                                      </span>
                                      <span className="font-semibold">
                                        {formatRp(dayData.deduction)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Subtotal */}
                                <div className="mt-2 pt-1 border-t border-emerald-300 flex justify-between items-center text-[11px]">
                                  <span className="font-bold text-emerald-900">
                                    Total
                                  </span>
                                  <span className="font-bold text-emerald-800">
                                    {formatRp(dayData.subtotal)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-red-400 font-bold text-[11px]">
                                TIDAK HADIR
                              </div>
                            )
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 italic text-[11px]">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* GRAND TOTAL */}
        <div className="mt-8 flex justify-end">
          <div className="bg-[#065F46] text-white py-4 px-8 w-full max-w-[600px] flex justify-between items-center rounded-sm">
            <span className="text-lg font-semibold tracking-wide">
              TOTAL GAJI DITERIMA
            </span>
            <span className="text-3xl font-bold">
              {formatRp(globalGrandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

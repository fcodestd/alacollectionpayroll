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

export default function SlipGajiPrint({
  employee,
  data,
  startDate,
  endDate,
  is7Days,
  isPdfMode = false,
}: {
  employee: any;
  data: any;
  startDate: string;
  endDate: string;
  is7Days: boolean;
  isPdfMode?: boolean;
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
      className={`w-full text-black bg-white ${
        isPdfMode
          ? ""
          : "hidden print:block print:fixed print:inset-0 print:bg-white print:z-[99999]"
      }`}
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="w-full max-w-[1200px] mx-auto p-4 pt-8">
        <div className="flex justify-between items-end border-b-4 border-blue-900 pb-4 mb-6">
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
              SLIP GAJI BORONGAN JAHIT
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
                Jabatan/Tugas
              </span>
              <span className="capitalize">: {employee.jenis}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex">
              <span className="w-32 font-semibold text-gray-700">
                Periode Kerja
              </span>
              <span>: {is7Days ? "Minggu Ini" : "Sesuai Pilihan"}</span>
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

        {chunks.map((week, index) => {
          return (
            <div key={index} className="mb-6 page-break-inside-avoid">
              <table className="w-full border-collapse border border-blue-200">
                <thead>
                  <tr className="bg-slate-50">
                    {week.map((day, idx) => (
                      <th
                        key={idx}
                        className="border border-blue-200 p-2 text-center w-[14.28%]"
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

                      return (
                        <td
                          key={idx}
                          className={`border border-blue-200 align-top p-0 h-48 ${isOutsidePeriod ? "bg-gray-50/50" : ""}`}
                        >
                          {isOutsidePeriod ? (
                            <div className="h-full w-full flex items-center justify-center text-gray-300 italic text-[10px]">
                              Luar Periode
                            </div>
                          ) : dayData ? (
                            <div className="p-2 space-y-4 text-[11px]">
                              {Object.entries(dayData).map(
                                ([pName, detail]: [string, any], itemIdx) => {
                                  globalGrandTotal += detail.subtotal;
                                  return (
                                    <div key={itemIdx}>
                                      <div className="font-bold text-gray-900 mb-1">
                                        {pName}
                                      </div>
                                      <div className="flex justify-between text-gray-700">
                                        <span>
                                          {detail.qty} pcs x{" "}
                                          {detail.price.toLocaleString("id-ID")}
                                        </span>
                                        <span className="font-bold">
                                          {formatRp(detail.subtotal)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
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
                <tfoot>
                  <tr className="bg-slate-50 text-[11px]">
                    {week.map((day, idx) => {
                      const dateStr = getLocalYMD(day);
                      const dayData = data[dateStr];
                      const isOutsidePeriod = day < startD || day > endD;
                      let totalPcs = 0;
                      let totalRp = 0;

                      if (!isOutsidePeriod && dayData) {
                        Object.values(dayData).forEach((detail: any) => {
                          totalPcs += detail.qty;
                          totalRp += detail.subtotal;
                        });
                      }

                      return (
                        <td key={idx} className="border border-blue-200 p-2">
                          {!isOutsidePeriod ? (
                            <div className="flex justify-between font-bold">
                              <span className="text-gray-600 font-normal">
                                {totalPcs} pcs
                              </span>
                              <span className="text-blue-900">
                                {formatRp(totalRp)}
                              </span>
                            </div>
                          ) : (
                            <div className="text-center text-gray-300">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        <div className="mt-8 flex justify-end">
          <div className="bg-[#1E3A8A] text-white py-4 px-8 w-full max-w-[600px] flex justify-between items-center rounded-sm">
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

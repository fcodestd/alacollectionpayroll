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

export default function SlipPotongPrint({
  employee,
  data,
  startDate,
  endDate,
  isPdfMode = false,
}: {
  employee: any;
  // UPDATE: Menambahkan properti `unit` ke dalam Record data
  data: Record<
    string,
    { qty: number; unit?: string; price: number; subtotal: number }
  >;
  startDate: string;
  endDate: string;
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
        <div className="flex justify-between items-end border-b-4 border-indigo-900 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">
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
              SLIP GAJI POTONG
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

        {chunks.map((week, index) => {
          return (
            <div key={index} className="mb-6 page-break-inside-avoid">
              <table className="w-full border-collapse border border-indigo-200">
                <thead>
                  <tr className="bg-slate-50">
                    {week.map((day, idx) => (
                      <th
                        key={idx}
                        className="border border-indigo-200 p-2 text-center w-[14.28%]"
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

                      if (!isOutsidePeriod && dayData)
                        globalGrandTotal += dayData.subtotal;

                      return (
                        <td
                          key={idx}
                          className={`border border-indigo-200 align-top p-0 h-40 ${isOutsidePeriod ? "bg-gray-50/50" : ""}`}
                        >
                          {isOutsidePeriod ? (
                            <div className="h-full w-full flex items-center justify-center text-gray-300 italic text-[10px]">
                              Luar Periode
                            </div>
                          ) : dayData ? (
                            <div className="h-full flex flex-col justify-center items-center text-center p-2 bg-indigo-50/10">
                              {/* UPDATE: Memunculkan unit Pcs/Roll dari database (fallback ke 'Roll' untuk data lama) */}
                              <p className="text-[11px] font-semibold text-gray-700 tracking-tight capitalize">
                                {dayData.qty} {dayData.unit || "Roll"} &times;{" "}
                                {formatRp(dayData.price)}
                              </p>
                              <div className="w-16 h-px bg-indigo-200 my-2"></div>
                              <p className="text-sm font-bold text-indigo-900">
                                {formatRp(dayData.subtotal)}
                              </p>
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
              </table>
            </div>
          );
        })}

        <div className="mt-8 flex justify-end">
          <div className="bg-[#312E81] text-white py-4 px-8 w-full max-w-[600px] flex justify-between items-center rounded-sm">
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

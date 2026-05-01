// app/employee/slip/slip-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import html2canvas from "html2canvas-pro"; // Pastikan sudah pakai pro
import { jsPDF } from "jspdf";

import SlipGajiPrint from "@/components/print/slip-gaji";
import SlipPotongPrint from "@/components/print/slip-potong";
import SlipHarianPrint from "@/components/print/slip-harian";

export default function EmployeeSlipClient({
  employee,
  data,
  jenis,
  startDate,
  endDate,
}: {
  employee: any;
  data: any;
  jenis: string;
  startDate: string;
  endDate: string;
}) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    const element = document.getElementById("pdf-content");
    if (!element) {
      setIsDownloading(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // UBAH: "p" menjadi "l" (Landscape)
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = `Slip_Gaji_${employee.name.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Gagal mengunduh PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/employee")}
            className="rounded-full shadow-sm bg-white"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Unduh Slip Gaji
          </h1>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileDown className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Slip Periode Minggu Ini
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tanggal: {startDate} s/d {endDate}
            </p>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl flex items-start gap-3 text-left border border-emerald-100">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-emerald-800 leading-relaxed">
              Sistem akan merangkum kinerja Anda dan mengunduhnya ke HP sebagai
              file <strong>PDF (Landscape)</strong>.
            </p>
          </div>

          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-xl"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Menyiapkan
                Dokumen...
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5 mr-2" /> Unduh PDF Sekarang
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AREA OFF-SCREEN - Diperlebar menjadi 1122px (Rasio A4 Landscape) */}
      <div className="absolute top-[-10000px] left-[-10000px] bg-white z-[-1]">
        <div id="pdf-content" className="w-[1122px] bg-white p-8">
          {jenis.includes("jahit") ? (
            <SlipGajiPrint
              employee={employee}
              data={data}
              startDate={startDate}
              endDate={endDate}
              is7Days={true}
              isPdfMode={true}
            />
          ) : jenis.includes("potong") ? (
            <SlipPotongPrint
              employee={employee}
              data={data}
              startDate={startDate}
              endDate={endDate}
              isPdfMode={true}
            />
          ) : jenis.includes("harian") ? (
            <SlipHarianPrint
              employee={employee}
              data={data}
              startDate={startDate}
              endDate={endDate}
              isPdfMode={true}
            />
          ) : (
            <div className="p-10 text-center text-red-500 font-bold">
              Tipe slip tidak dikenali
            </div>
          )}
        </div>
      </div>
    </>
  );
}

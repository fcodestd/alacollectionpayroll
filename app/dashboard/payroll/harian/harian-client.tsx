// app/dashboard/payroll/harian/harian-client.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Lock,
  FileSignature,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";

import {
  checkExistingDailyBatch,
  createDraftDailyBatch,
  deleteDraftDailyBatch,
  finalizeDailyBatch,
} from "@/lib/actions/harian";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
const getTodayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const formatTanggalIndo = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function HarianClientPage({
  employees,
  operatorId,
}: {
  employees: any[];
  operatorId: number;
}) {
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const targetDate = getTodayYMD();
  const [isCheckingDate, setIsCheckingDate] = useState(false);

  const [draftId, setDraftId] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState<string>("");
  const [globalSalary, setGlobalSalary] = useState<number>(0);

  const [items, setItems] = useState<any[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // --- 1. LOCAL STORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem("draftPayrollHarian");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.targetDate !== getTodayYMD()) {
        localStorage.removeItem("draftPayrollHarian");
      } else {
        setStep(2);
        setDraftId(data.draftId);
        setDraftCode(data.draftCode);
        setGlobalSalary(data.globalSalary);
        setItems(data.items || []);
      }
    }
  }, []);

  useEffect(() => {
    if (step === 2 && draftId) {
      localStorage.setItem(
        "draftPayrollHarian",
        JSON.stringify({ draftId, draftCode, targetDate, globalSalary, items }),
      );
    }
  }, [step, draftId, draftCode, targetDate, globalSalary, items]);

  // --- 2. SINKRONISASI GAJI GLOBAL ---
  // Jika gaji global diubah, terapkan HANYA ke karyawan yang statusnya "hadir"
  useEffect(() => {
    if (items.length > 0 && globalSalary > 0) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.status === "hadir") {
            const newBase = globalSalary;
            const newSubtotal = newBase + item.bonus - item.deduction;
            return { ...item, baseSalary: newBase, subtotal: newSubtotal };
          }
          return item;
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSalary]);

  // --- 3. ALUR MULAI ---
  const handleStartTransaction = async () => {
    setIsCheckingDate(true);
    const isExists = await checkExistingDailyBatch(targetDate);

    if (isExists) {
      toast({
        title: "Akses Ditolak",
        description: `Gaji harian untuk hari ini (${formatTanggalIndo(targetDate)}) sudah dikerjakan.`,
        variant: "destructive",
      });
      setIsCheckingDate(false);
      return;
    }

    const res = await createDraftDailyBatch(operatorId, targetDate);
    setIsCheckingDate(false);

    if (res.success) {
      setDraftId(res.data.id);
      setDraftCode(res.data.code);

      const initialItems = employees.map((emp) => ({
        employeeId: emp.id,
        name: emp.name,
        status: "hadir",
        baseSalary: globalSalary,
        bonus: 0,
        bonusReason: "",
        deduction: 0,
        deductionReason: "",
        subtotal: globalSalary,
      }));
      setItems(initialItems);
      setStep(2);
    } else {
      toast({
        title: "Gagal",
        description: "Tidak dapat membuat draft.",
        variant: "destructive",
      });
    }
  };

  // --- 4. HANDLE PERUBAHAN INPUT INDIVIDU ---
  const handleItemChange = (empId: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.employeeId === empId) {
          let updated = { ...item, [field]: value };

          // Logika Otomatis saat ganti status
          if (field === "status") {
            if (value === "tidak hadir") updated.baseSalary = 0;
            if (value === "hadir") updated.baseSalary = globalSalary; // Kembali ke standar
          }

          // Hitung ulang subtotal setiap ada perubahan angka
          updated.subtotal =
            Number(updated.baseSalary) +
            Number(updated.bonus) -
            Number(updated.deduction);
          return updated;
        }
        return item;
      }),
    );
  };

  const grandTotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalHadir = items.filter((i) => i.status === "hadir").length;

  // --- 5. FINALISASI ---
  const confirmFinalize = async () => {
    setIsFinalizing(true);
    const res = await finalizeDailyBatch(draftId!, items, grandTotal);
    setIsFinalizing(false);

    if (res.success) {
      toast({
        title: "Tersimpan",
        description: "Gaji harian berhasil diproses.",
      });
      localStorage.removeItem("draftPayrollHarian");
      resetState();
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const confirmCancelDraft = async () => {
    if (draftId) await deleteDraftDailyBatch(draftId);
    localStorage.removeItem("draftPayrollHarian");
    resetState();
    toast({
      title: "Draft Dihapus",
      description: "Header transaksi dibatalkan.",
    });
  };

  const resetState = () => {
    setStep(1);
    setDraftId(null);
    setGlobalSalary(0);
    setItems([]);
    setIsConfirmOpen(false);
    setIsCancelDialogOpen(false);
  };

  // ===================== RENDER LAYAR =====================

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-emerald-50/50 p-8 border-b border-emerald-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 ring-8 ring-white shadow-sm">
            <FileSignature className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Batch Gaji Harian
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Sistem presensi dan input gaji pokok khusus untuk hari ini.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Tanggal Pengerjaan (Hari ini)
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={formatTanggalIndo(targetDate)}
                disabled
                className="pl-11 h-12 bg-slate-50/80 border-slate-200 text-slate-900 font-semibold opacity-100 cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          <Button
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            onClick={handleStartTransaction}
            disabled={isCheckingDate}
          >
            {isCheckingDate ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Buka Sesi Harian"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // --- STEP 2: MAIN FORM ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28">
      {/* 1. HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <Badge
              variant="outline"
              className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-3 py-1"
            >
              <FileSignature className="w-3.5 h-3.5 mr-1.5 inline" /> Batch
              Harian
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {formatTanggalIndo(targetDate)}
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
              ID Sesi:{" "}
              <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                {draftCode}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm pt-2">
            <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-semibold shadow-sm">
              <CheckCircle2 className="h-4 w-4" /> Mode Draft Aktif
            </span>
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl p-6 min-w-[320px] flex flex-col justify-center border border-slate-800 shadow-xl shadow-slate-900/10">
          <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">
            Total Gaji Dibayarkan
          </p>
          <p className="text-4xl lg:text-5xl font-black tracking-tighter text-emerald-400 mt-1">
            {formatRp(grandTotal)}
          </p>
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-300">
            <span className="font-medium">Kehadiran:</span>
            <span className="font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">
              {totalHadir} / {items.length} Orang
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD & GLOBAL CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* PANEL KONTROL GAJI GLOBAL */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950">
                  Gaji Pokok Standar (Global)
                </h3>
                <p className="text-xs text-emerald-700/70 mt-0.5 font-medium">
                  Bisa di-edit manual per karyawan di tabel.
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-slate-200 w-full sm:w-auto">
              <span className="text-sm font-bold text-slate-400 px-4">Rp</span>
              <Input
                type="number"
                min="0"
                value={globalSalary || ""}
                onChange={(e) => setGlobalSalary(Number(e.target.value))}
                className="border-0 shadow-none focus-visible:ring-0 text-right font-black text-lg text-slate-900 w-full sm:w-40 h-10 placeholder:text-slate-300"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* TABEL LIST KARYAWAN (MULTIPLE INPUTS) */}
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100 bg-slate-50/80">
                <TableHead className="w-[20%] h-14 text-xs font-bold text-slate-500 uppercase tracking-wider pl-8">
                  Karyawan & Status
                </TableHead>
                <TableHead className="w-[15%] h-14 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Gaji Pokok
                </TableHead>
                <TableHead className="w-[25%] h-14 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tambahan (Bonus)
                </TableHead>
                <TableHead className="w-[25%] h-14 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Potongan
                </TableHead>
                <TableHead className="w-[15%] h-14 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">
                  Total Bersih
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.employeeId}
                  className={`border-b border-slate-100 ${item.status === "tidak hadir" ? "bg-slate-50/50 opacity-60 grayscale-[30%]" : "hover:bg-slate-50"}`}
                >
                  {/* KOLOM 1: Nama & Status */}
                  <TableCell className="pl-8 py-4 align-top">
                    <div className="font-bold text-slate-900 mb-2">
                      {item.name}
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleItemChange(
                          item.employeeId,
                          "status",
                          e.target.value,
                        )
                      }
                      className={`text-xs font-semibold rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 ${item.status === "hadir" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
                    >
                      <option value="hadir">Hadir</option>
                      <option value="tidak hadir">Tidak Hadir</option>
                    </select>
                  </TableCell>

                  {/* KOLOM 2: Gaji Pokok (Editable) */}
                  <TableCell className="py-4 align-top">
                    <Input
                      type="number"
                      min="0"
                      value={item.baseSalary || ""}
                      onChange={(e) =>
                        handleItemChange(
                          item.employeeId,
                          "baseSalary",
                          Number(e.target.value),
                        )
                      }
                      className="w-28 text-center font-bold text-sm mx-auto h-9 border-slate-200 focus-visible:ring-emerald-400 bg-white shadow-sm"
                      placeholder="0"
                      disabled={item.status === "tidak hadir"}
                    />
                  </TableCell>

                  {/* KOLOM 3: Tambahan / Bonus */}
                  <TableCell className="py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.bonus || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.employeeId,
                            "bonus",
                            Number(e.target.value),
                          )
                        }
                        className="w-full font-semibold text-sm h-9 border-slate-200 focus-visible:ring-blue-400 bg-blue-50/30 text-blue-700 placeholder:text-blue-300"
                        placeholder="Rp Tambahan"
                      />
                      <Input
                        type="text"
                        value={item.bonusReason || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.employeeId,
                            "bonusReason",
                            e.target.value,
                          )
                        }
                        className="w-full text-xs h-8 border-dashed border-slate-300 focus-visible:border-solid placeholder:text-slate-400"
                        placeholder="Alasan (Lembur, dll)"
                        disabled={!item.bonus}
                      />
                    </div>
                  </TableCell>

                  {/* KOLOM 4: Potongan */}
                  <TableCell className="py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.deduction || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.employeeId,
                            "deduction",
                            Number(e.target.value),
                          )
                        }
                        className="w-full font-semibold text-sm h-9 border-slate-200 focus-visible:ring-red-400 bg-red-50/30 text-red-700 placeholder:text-red-300"
                        placeholder="Rp Potongan"
                      />
                      <Input
                        type="text"
                        value={item.deductionReason || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.employeeId,
                            "deductionReason",
                            e.target.value,
                          )
                        }
                        className="w-full text-xs h-8 border-dashed border-slate-300 focus-visible:border-solid placeholder:text-slate-400"
                        placeholder="Alasan (Kasbon, telat)"
                        disabled={!item.deduction}
                      />
                    </div>
                  </TableCell>

                  {/* KOLOM 5: Subtotal Akhir */}
                  <TableCell className="py-4 pr-8 text-right align-top pt-5">
                    <span
                      className={`font-black text-lg tracking-tight ${item.subtotal > 0 ? "text-emerald-700" : "text-slate-300"}`}
                    >
                      {formatRp(item.subtotal)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-slate-400 font-medium"
                  >
                    Tidak ada data karyawan harian yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-end gap-3 z-40 md:pl-[250px] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl w-full mx-auto flex justify-end gap-3 items-center">
          <Button
            variant="ghost"
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold"
          >
            Batalkan Transaksi
          </Button>
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            onClick={() => setIsConfirmOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" /> Simpan Gaji Harian
          </Button>
        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmFinalize}
        isLoading={isFinalizing}
        title="Finalisasi Gaji Harian"
        description={`Anda akan mengunci data absen dan gaji untuk hari ini. Total yang dibayarkan adalah ${formatRp(grandTotal)}.`}
        confirmText="Ya, Kunci & Simpan"
      />
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancelDraft}
        title="Batalkan Pekerjaan Hari Ini?"
        description="Sesi input ini akan dihapus sepenuhnya."
        confirmText="Ya, Batalkan Sesi"
      />
    </div>
  );
}

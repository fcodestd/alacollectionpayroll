"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Lock,
  Save,
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
  checkExistingCuttingBatch,
  createDraftCuttingBatch,
  deleteDraftCuttingBatch,
  finalizeCuttingBatch,
} from "@/lib/actions/cutting";

// Helper Tanggal & Currency
const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

const getTodayYMD = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTanggalIndo = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function CuttingClientPage({
  employees,
  operatorId,
}: {
  employees: any[];
  operatorId: number;
}) {
  const { toast } = useToast();
  const router = useRouter();

  // State Navigasi
  const [step, setStep] = useState<1 | 2>(1);
  const targetDate = getTodayYMD();
  const [isCheckingDate, setIsCheckingDate] = useState(false);

  // State Transaksi (Header)
  const [draftId, setDraftId] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState<string>("");

  // BARU: State untuk dua harga global
  const [globalPriceRoll, setGlobalPriceRoll] = useState<number>(0);
  const [globalPricePcs, setGlobalPricePcs] = useState<number>(0);

  // State Items: [{ employeeId, name, qty, unit, price, subtotal }]
  const [items, setItems] = useState<any[]>([]);

  // State Modal
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // --- 1. LOCAL STORAGE PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem("draftCuttingBatch");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.targetDate !== getTodayYMD()) {
        localStorage.removeItem("draftCuttingBatch");
      } else {
        setStep(2);
        setDraftId(data.draftId);
        setDraftCode(data.draftCode);
        // Mendukung data lama atau baru
        setGlobalPriceRoll(data.globalPriceRoll || data.globalPrice || 0);
        setGlobalPricePcs(data.globalPricePcs || 0);
        setItems(data.items || []);
      }
    }
  }, []);

  useEffect(() => {
    if (step === 2 && draftId) {
      localStorage.setItem(
        "draftCuttingBatch",
        JSON.stringify({
          draftId,
          draftCode,
          targetDate,
          globalPriceRoll,
          globalPricePcs,
          items,
        }),
      );
    }
  }, [
    step,
    draftId,
    draftCode,
    targetDate,
    globalPriceRoll,
    globalPricePcs,
    items,
  ]);

  // --- 2. SINKRONISASI HARGA GLOBAL ---
  // Jika admin mengetik harga global, update semua harga di tabel sesuai dengan satuannya
  useEffect(() => {
    if (items.length > 0) {
      setItems((prev) =>
        prev.map((item) => {
          const appliedPrice =
            item.unit === "pcs" ? globalPricePcs : globalPriceRoll;
          return {
            ...item,
            price: appliedPrice,
            subtotal: (item.qty || 0) * appliedPrice,
          };
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalPriceRoll, globalPricePcs]);

  // --- 3. ALUR MULAI TRANSAKSI ---
  const handleStartTransaction = async () => {
    setIsCheckingDate(true);
    const isExists = await checkExistingCuttingBatch(targetDate);

    if (isExists) {
      toast({
        title: "Akses Ditolak",
        description: `Batch potong untuk hari ini sudah dikerjakan.`,
        variant: "destructive",
      });
      setIsCheckingDate(false);
      return;
    }

    const res = await createDraftCuttingBatch(operatorId, targetDate);
    setIsCheckingDate(false);

    if (res.success) {
      setDraftId(res.data.id);
      setDraftCode(res.data.code);

      const initialItems = employees.map((emp) => ({
        employeeId: emp.id,
        name: emp.name,
        qty: 0,
        unit: "roll", // Default satuan
        price: globalPriceRoll,
        subtotal: 0,
      }));
      setItems(initialItems);
      setStep(2);
    } else {
      toast({
        title: "Gagal",
        description: "Tidak dapat membuat draft transaksi.",
        variant: "destructive",
      });
    }
  };

  // --- 4. UPDATE QTY & UNIT PER BARIS ---
  const handleUpdateQty = (empId: number, val: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.employeeId === empId) {
          return { ...item, qty: val, subtotal: val * item.price };
        }
        return item;
      }),
    );
  };

  const handleUpdateUnit = (empId: number, newUnit: "roll" | "pcs") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.employeeId === empId) {
          const newPrice = newUnit === "pcs" ? globalPricePcs : globalPriceRoll;
          return {
            ...item,
            unit: newUnit,
            price: newPrice,
            subtotal: (item.qty || 0) * newPrice,
          };
        }
        return item;
      }),
    );
  };

  // Kalkulasi total
  const grandTotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalRolls = items
    .filter((i) => i.unit === "roll")
    .reduce((acc, curr) => acc + (curr.qty || 0), 0);
  const totalPcs = items
    .filter((i) => i.unit === "pcs")
    .reduce((acc, curr) => acc + (curr.qty || 0), 0);
  const totalInputCount = items.filter((i) => (i.qty || 0) > 0).length;

  // --- 5. FINALISASI & PEMBATALAN ---
  const confirmFinalize = async () => {
    if (totalInputCount === 0) {
      toast({
        title: "Data Kosong",
        description:
          "Setidaknya ada 1 karyawan yang menghasilkan potongan hari ini.",
        variant: "destructive",
      });
      setIsConfirmOpen(false);
      return;
    }

    setIsFinalizing(true);
    const res = await finalizeCuttingBatch(draftId!, items, grandTotal);
    setIsFinalizing(false);

    if (res.success) {
      toast({
        title: "Tersimpan",
        description: "Gaji batch potong berhasil diproses.",
      });
      localStorage.removeItem("draftCuttingBatch");
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
    if (draftId) {
      await deleteDraftCuttingBatch(draftId);
    }
    localStorage.removeItem("draftCuttingBatch");
    resetState();
    toast({
      title: "Draft Dihapus",
      description: "Header transaksi dibatalkan dan dihapus.",
    });
  };

  const resetState = () => {
    setStep(1);
    setDraftId(null);
    setGlobalPriceRoll(0);
    setGlobalPricePcs(0);
    setItems([]);
    setIsConfirmOpen(false);
    setIsCancelDialogOpen(false);
  };

  // ===================== RENDER LAYAR =====================
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-5 ring-8 ring-white shadow-sm">
            <Scissors className="h-9 w-9 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Batch Potong Harian
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Inisiasi data borongan pemotongan kain khusus untuk hari ini.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Tanggal Pengerjaan (Hari Ini)
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

          <div className="space-y-3">
            <Button
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
              onClick={handleStartTransaction}
              disabled={isCheckingDate}
            >
              {isCheckingDate ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Buka Sesi Hari Ini"
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-900"
              onClick={() => router.push("/dashboard/payroll/borongan")}
            >
              Kembali ke Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: MAIN INPUT FORM ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28">
      {/* 1. HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <Badge
              variant="outline"
              className="mb-3 bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold px-3 py-1"
            >
              <Scissors className="w-3.5 h-3.5 mr-1.5 inline" /> Batch Potong
              Kain
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
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-semibold shadow-sm">
              <CheckCircle2 className="h-4 w-4" /> Mode Draft Aktif
            </span>
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl p-6 min-w-[320px] flex flex-col justify-center border border-slate-800 shadow-xl shadow-slate-900/10">
          <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">
            Total Biaya Potong
          </p>
          <p className="text-4xl lg:text-5xl font-black tracking-tighter text-indigo-400 mt-1">
            {formatRp(grandTotal)}
          </p>
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-sm text-slate-300">
            <span className="font-medium">Total Dikerjakan:</span>
            <div className="flex gap-2">
              <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded-lg text-xs">
                {totalRolls} Roll
              </span>
              <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded-lg text-xs">
                {totalPcs} Pcs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD & GLOBAL PRICE CONTROL */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* PANEL DUA HARGA GLOBAL */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Tarif Dasar Potong</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Tentukan harga global, sistem akan otomatis menghitung ke
                karyawan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Input Harga Roll */}
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                <span className="text-sm font-bold text-slate-400 px-3 border-r border-slate-100">
                  Roll
                </span>
                <span className="text-sm font-bold text-slate-400 px-2">
                  Rp
                </span>
                <Input
                  type="number"
                  min="0"
                  value={globalPriceRoll || ""}
                  onChange={(e) => setGlobalPriceRoll(Number(e.target.value))}
                  className="border-0 shadow-none focus-visible:ring-0 text-right font-black text-slate-900 w-full sm:w-28 h-9 placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
              {/* Input Harga Pcs */}
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                <span className="text-sm font-bold text-slate-400 px-3 border-r border-slate-100">
                  Pcs
                </span>
                <span className="text-sm font-bold text-slate-400 px-2">
                  Rp
                </span>
                <Input
                  type="number"
                  min="0"
                  value={globalPricePcs || ""}
                  onChange={(e) => setGlobalPricePcs(Number(e.target.value))}
                  className="border-0 shadow-none focus-visible:ring-0 text-right font-black text-slate-900 w-full sm:w-28 h-9 placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABEL LIST KARYAWAN */}
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100 bg-white">
                <TableHead className="w-[35%] h-12 text-xs font-bold text-slate-500 uppercase tracking-wider pl-8">
                  Nama Karyawan
                </TableHead>
                <TableHead className="w-[25%] h-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Qty & Satuan
                </TableHead>
                <TableHead className="w-[20%] h-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Tarif Satuan
                </TableHead>
                <TableHead className="w-[20%] h-12 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">
                  Subtotal Bersih
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.employeeId}
                  className={`transition-all duration-200 border-b border-slate-50 ${item.qty > 0 ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                >
                  <TableCell className="pl-8 py-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step={item.unit === "roll" ? "0.1" : "1"} // Roll bisa desimal, Pcs wajib bulat
                        value={item.qty || ""}
                        onChange={(e) =>
                          handleUpdateQty(
                            item.employeeId,
                            Number(e.target.value),
                          )
                        }
                        className={`w-20 text-center font-bold text-base h-10 transition-all shadow-sm ${item.qty > 0 ? "border-indigo-400 bg-white text-indigo-900 ring-1 ring-indigo-100" : "border-slate-200 bg-slate-50"}`}
                        placeholder="0"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          handleUpdateUnit(
                            item.employeeId,
                            e.target.value as "roll" | "pcs",
                          )
                        }
                        className="h-10 px-2 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="roll">Roll</option>
                        <option value="pcs">Pcs</option>
                      </select>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span className="text-sm font-semibold text-slate-400">
                      {formatRp(item.price)}{" "}
                      <span className="text-xs">/{item.unit}</span>
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-8">
                    <span
                      className={`font-bold text-lg tracking-tight ${item.qty > 0 ? "text-indigo-700" : "text-slate-300"}`}
                    >
                      {formatRp(item.subtotal)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
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
            className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-indigo-600/20"
            onClick={() => setIsConfirmOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" /> Simpan Batch
          </Button>
        </div>
      </div>

      {/* MODAL DIALOGS */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmFinalize}
        isLoading={isFinalizing}
        title="Finalisasi Batch Potong"
        description={`Anda akan mengunci data potong kain hari ini. Total upah yang harus disiapkan adalah ${formatRp(grandTotal)}.`}
        confirmText="Ya, Kunci & Simpan"
      />

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancelDraft}
        title="Batalkan Pekerjaan Hari Ini?"
        description="Sesi input ini akan dihapus sepenuhnya. Karyawan yang sudah diisi jumlah potongannya akan hilang."
        confirmText="Ya, Batalkan Sesi"
      />
    </div>
  );
}

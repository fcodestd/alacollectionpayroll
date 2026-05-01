"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Shirt,
  ChevronLeft,
  User,
  Plus,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDebouncedCallback } from "use-debounce";
import {
  createDraftPayroll,
  searchProducts,
  finalizePayroll,
} from "@/lib/actions/payroll";
import { Badge } from "@/components/ui/badge";

const formatRp = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export default function JahitClientPage({
  employees,
  operatorId,
}: {
  employees: any[];
  operatorId: number;
}) {
  const { toast } = useToast();
  const router = useRouter();

  // Step sekarang hanya 1 (Pilih Karyawan) atau 2 (Input Data)
  const [step, setStep] = useState<1 | 2>(1);

  // State Step 1 (Pencarian Karyawan)
  const [empSearch, setEmpSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // State Step 2 (Transaksi)
  const [draftId, setDraftId] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);

  // State Dialog
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // --- 1. LOCAL STORAGE PERSISTENCE (Key Khusus Jahit) ---
  useEffect(() => {
    const saved = localStorage.getItem("draftPayrollJahit");
    if (saved) {
      const data = JSON.parse(saved);
      setStep(2);
      setSelectedEmp(data.selectedEmp);
      setDraftId(data.draftId);
      setDraftCode(data.draftCode);
      setItems(data.items || []);
    }
  }, []);

  useEffect(() => {
    if (step === 2 && draftId) {
      localStorage.setItem(
        "draftPayrollJahit",
        JSON.stringify({
          selectedEmp,
          draftId,
          draftCode,
          items,
        }),
      );
    }
  }, [step, selectedEmp, draftId, draftCode, items]);

  // --- 2. ALUR MEMILIH KARYAWAN ---
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(empSearch.toLowerCase()),
  );

  const handleSelectEmployee = async (emp: any) => {
    setSelectedEmp(emp);
    // Hardcode workType "jahit" karena ini halaman khusus jahit
    const res = await createDraftPayroll(emp.id, operatorId, "jahit");
    if (res.success) {
      setDraftId(res.data.id);
      setDraftCode(res.data.code);
      setStep(2);
      setItems([
        {
          tempId: Date.now().toString(),
          productId: null,
          productName: "",
          price: 0,
          qty: 1,
          subtotal: 0,
        },
      ]);
    } else {
      toast({
        title: "Error",
        description: "Gagal membuat sesi transaksi.",
        variant: "destructive",
      });
    }
  };

  // --- 3. LOGIKA ITEM ---
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        tempId: Date.now().toString(),
        productId: null,
        productName: "",
        price: 0,
        qty: 1,
        subtotal: 0,
      },
    ]);
  };

  const handleDeleteItem = (tempId: string) => {
    setItems(items.filter((i) => i.tempId !== tempId));
  };

  const handleUpdateItem = (tempId: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.tempId === tempId) {
          const updated = { ...item, [field]: value };
          if (field === "qty" || field === "price") {
            updated.subtotal = updated.price * (updated.qty || 0);
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const handleSelectProduct = (tempId: string, product: any) => {
    setItems(
      items.map((item) => {
        if (item.tempId === tempId) {
          const price = Number(product.price);
          return {
            ...item,
            productId: product.id,
            productName: product.name,
            price: price,
            subtotal: price * (item.qty || 1),
          };
        }
        return item;
      }),
    );
  };

  const grandTotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalPcs = items.reduce((acc, curr) => acc + (curr.qty || 0), 0);

  // --- 4. FINALISASI ---
  const confirmFinalize = async () => {
    if (items.length === 0 || items.some((i) => !i.productId || i.qty <= 0)) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Pastikan semua baris memiliki produk dan QTY minimal 1.",
        variant: "destructive",
      });
      setIsConfirmOpen(false);
      return;
    }

    setIsFinalizing(true);
    const res = await finalizePayroll(draftId!, items, grandTotal);
    setIsFinalizing(false);

    if (res.success) {
      toast({
        title: "Transaksi Berhasil",
        description: "Data payroll jahit telah masuk ke dalam sistem.",
      });
      localStorage.removeItem("draftPayrollJahit");
      resetState();
    } else {
      toast({
        title: "Gagal Menyimpan",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const confirmCancelDraft = () => {
    localStorage.removeItem("draftPayrollJahit");
    resetState();
    toast({
      title: "Draft Dihapus",
      description: "Sesi transaksi borongan telah dibatalkan.",
    });
  };

  const resetState = () => {
    setStep(1);
    setSelectedEmp(null);
    setDraftId(null);
    setItems([]);
    setIsConfirmOpen(false);
    setIsCancelDialogOpen(false);
  };

  // ===================== RENDER LAYAR =====================

  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto mt-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col h-[70vh] max-h-[600px]">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/payroll/borongan")}
            className="h-9 w-9 shrink-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Pilih Karyawan Jahit
            </h2>
            <p className="text-sm text-slate-500 capitalize">
              Menampilkan semua karyawan jahit
            </p>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama karyawan..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="pl-9 h-10 border-slate-200 bg-slate-50 focus-visible:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="p-2 flex-1 overflow-y-auto">
          {filteredEmployees.length > 0 ? (
            <div className="grid gap-1.5">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="flex items-center justify-between p-3.5 border border-transparent rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {emp.name}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                    <ChevronLeft className="h-4 w-4 text-slate-400 rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
              <User className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm font-medium text-slate-600">
                Tidak ada karyawan jahit ditemukan.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 2: MAIN INPUT FORM ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28">
      {/* HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-blue-50 text-blue-600 border-blue-200 font-medium px-3"
            >
              <Shirt className="w-3 h-3 mr-1.5 inline" /> Proses Jahit
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {selectedEmp?.name}
            </h2>
            <p className="text-sm text-slate-500 font-mono mt-1">
              Ref: {draftCode}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Draft
              Tersimpan
            </span>
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-xl p-5 min-w-[280px] flex flex-col justify-center border border-slate-800 shadow-inner">
          <p className="text-slate-400 text-sm font-medium mb-1">
            Total Upah Jahit
          </p>
          <p className="text-3xl lg:text-4xl font-bold tracking-tighter">
            {formatRp(grandTotal)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-sm text-slate-300">
            <span>Total Kuantitas:</span>
            <span className="font-semibold text-white">{totalPcs} Pcs</span>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
        <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center bg-transparent">
          <div>
            <h3 className="font-semibold text-slate-900 tracking-tight">
              Rincian Pekerjaan Jahit
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan produk dan jumlah yang dijahit.
            </p>
          </div>
          <Button
            onClick={handleAddItem}
            size="sm"
            variant="outline"
            className="gap-2 h-9 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
          >
            <Plus className="h-4 w-4" /> Tambah 
          </Button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-[45%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-6">
                  Produk / Item
                </TableHead>
                <TableHead className="w-[20%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tarif Dasar
                </TableHead>
                <TableHead className="w-[10%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Qty
                </TableHead>
                <TableHead className="w-[20%] h-11 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Subtotal
                </TableHead>
                <TableHead className="w-[5%] h-11 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const otherSelectedIds = items
                  .filter(
                    (i) => i.tempId !== item.tempId && i.productId !== null,
                  )
                  .map((i) => i.productId);

                return (
                  <TableRow
                    key={item.tempId}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group"
                  >
                    <TableCell className="pl-6 align-top pt-4">
                      <ProductLiveSearch
                        initialName={item.productName}
                        excludedIds={otherSelectedIds}
                        onSelect={(product) =>
                          handleSelectProduct(item.tempId, product)
                        }
                      />
                    </TableCell>
                    <TableCell className="align-top pt-6 font-medium text-slate-600">
                      {item.price > 0 ? (
                        formatRp(item.price)
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top pt-4 text-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.qty || ""}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.tempId,
                            "qty",
                            Number(e.target.value),
                          )
                        }
                        className="w-16 text-center font-semibold mx-auto h-9 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
                      />
                    </TableCell>
                    <TableCell className="align-top pt-6 text-right font-bold text-slate-900 tracking-tight">
                      {formatRp(item.subtotal)}
                    </TableCell>
                    <TableCell className="align-top pt-4 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteItem(item.tempId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-12 w-12 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-3">
                        <Plus className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Belum ada rincian pekerjaan
                      </p>
                      <Button
                        onClick={handleAddItem}
                        variant="link"
                        className="text-blue-600 mt-2 h-auto p-0"
                      >
                        Tambah Baris Sekarang
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end gap-3 z-40 md:pl-[250px]">
        <div className="max-w-6xl w-full mx-auto flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            Batalkan & Hapus Draft
          </Button>
          <Button
            className="bg-slate-950 hover:bg-slate-800 text-white font-semibold px-8 shadow-md"
            onClick={() => setIsConfirmOpen(true)}
          >
            Simpan Transaksi
          </Button>
        </div>
      </div>

      {/* MODAL DIALOGS */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmFinalize}
        isLoading={isFinalizing}
        title="Konfirmasi Finalisasi"
        description={`Kunci data jahitan untuk ${selectedEmp?.name}. Total upah: ${formatRp(grandTotal)}.`}
        confirmText="Ya, Simpan Final"
      />
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancelDraft}
        title="Hapus Draft Transaksi?"
        description="Pekerjaan yang belum di-simpan ini akan dibuang secara permanen. Anda yakin?"
        confirmText="Ya, Hapus Draft"
      />
    </div>
  );
}

// =========================================================================
// KOMPONEN: PRODUCT LIVE SEARCH (REACT PORTAL ANTI-CLIPPING)
// =========================================================================
function ProductLiveSearch({
  initialName,
  onSelect,
  excludedIds,
}: {
  initialName: string;
  onSelect: (prod: any) => void;
  excludedIds: number[];
}) {
  const [query, setQuery] = useState(initialName);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [isOpen]);

  const handleSearch = useDebouncedCallback(async (val: string) => {
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    const data = await searchProducts(val);
    const filteredData = data.filter((prod) => !excludedIds.includes(prod.id));
    setResults(filteredData);
    setIsOpen(true);
    setIsLoading(false);
  }, 300);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedInsideInput =
        inputWrapperRef.current &&
        inputWrapperRef.current.contains(event.target as Node);
      const clickedInsideDropdown =
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node);
      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full min-w-[280px]" ref={inputWrapperRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Cari produk..."
          className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 shadow-sm transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </div>
      {mounted &&
        isOpen &&
        results.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-[9999] bg-white border border-slate-200 shadow-xl rounded-xl max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownCoords.top}px`,
              left: `${dropdownCoords.left}px`,
              width: `${dropdownCoords.width}px`,
            }}
          >
            <div className="p-1.5 flex flex-col gap-0.5">
              {results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setQuery(prod.name);
                    setIsOpen(false);
                    onSelect(prod);
                  }}
                  className="flex items-center justify-between px-3 py-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                >
                  <span className="font-medium text-sm text-slate-900 truncate pr-4">
                    {prod.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {formatRp(Number(prod.price))}
                  </span>
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

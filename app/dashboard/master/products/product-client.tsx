// app/dashboard/master/products/product-client.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  PackagePlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  Edit,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product";

// Fungsi Helper Format Rupiah
const formatRp = (angka: number | string) => {
  const num = typeof angka === "string" ? parseFloat(angka) : angka;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
};

export default function ProductClientPage({
  data,
  totalPages,
}: {
  data: any[];
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDelDialogOpen, setIsDelDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";

  // --- LOGIKA PENCARIAN & PAGINASI ---
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) params.set("q", term);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const goToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // --- LOGIKA CRUD ---
  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);

    const res = await createProduct(values);
    setIsSubmitting(false);

    if (res.success) {
      toast({ title: "Tersimpan", description: res.message });
      setIsAddModalOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);

    const res = await updateProduct(selectedProduct.id, values);
    setIsSubmitting(false);

    if (res.success) {
      toast({ title: "Diperbarui", description: res.message });
      setIsEditModalOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  async function confirmDelete() {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const res = await deleteProduct(selectedProduct.id);
    setIsSubmitting(false);

    if (res.success) {
      toast({ title: "Dihapus", description: res.message });
      setIsDelDialogOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* --- Top Controls --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="Cari nama produk..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-blue-500/30"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchQuery}
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-2"
        >
          <PackagePlus className="h-4 w-4" />
          <span>Tambah Produk</span>
        </Button>
      </div>

      {/* --- Table Container --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
                <TableHead className="h-12 px-6 font-semibold text-slate-600 w-1/2">
                  Nama Produk
                </TableHead>
                <TableHead className="h-12 px-6 font-semibold text-slate-600 w-1/4">
                  Tarif / Harga
                </TableHead>
                <TableHead className="h-12 px-6 font-semibold text-slate-600 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                          <Package className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <span className="font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                        {formatRp(item.price)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedProduct(item);
                            setIsDelDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Package className="h-8 w-8 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        Produk tidak ditemukan.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Halaman{" "}
            <span className="font-semibold text-slate-900">{currentPage}</span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-900">
              {totalPages || 1}
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="bg-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="bg-white"
            >
              Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MODAL TAMBAH PRODUK ================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-white text-lg font-semibold">
              Tambah Produk Baru
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-1">
              Masukkan rincian item/produk.
            </DialogDescription>
          </div>
          <form onSubmit={handleAdd} className="px-6 py-6 space-y-5 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Nama Produk</Label>
                <Input
                  id="add-name"
                  name="name"
                  required
                  placeholder="Contoh: Manset"
                  className="h-11 rounded-lg bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-price">Harga Tarif (Rp)</Label>
                <Input
                  id="add-price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000"
                  className="h-11 rounded-lg bg-slate-50"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-11 px-6 rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Memproses...
                  </>
                ) : (
                  "Simpan Produk"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL EDIT PRODUK ================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-white text-lg font-semibold">
              Edit Data Produk
            </DialogTitle>
          </div>
          {selectedProduct && (
            <form
              onSubmit={handleEdit}
              className="px-6 py-6 space-y-5 bg-white"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Produk</Label>
                  <Input
                    name="name"
                    defaultValue={selectedProduct.name}
                    required
                    className="h-11 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga Tarif (Rp)</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={selectedProduct.price}
                    required
                    className="h-11 rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-11 px-6 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-blue-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Modal Konfirmasi Hapus --- */}
      <ConfirmDialog
        isOpen={isDelDialogOpen}
        onClose={() => {
          setIsDelDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
        title="Hapus Produk?"
        description={`Data produk "${selectedProduct?.name}" akan dihapus. Aksi ini tidak dapat dilakukan jika produk sudah memiliki riwayat pada sistem payroll.`}
      />
    </div>
  );
}

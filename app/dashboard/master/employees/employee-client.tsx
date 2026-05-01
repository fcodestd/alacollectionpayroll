// app/dashboard/master/employees/employee-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Users,
  Loader2,
  Edit,
  Link2,
  Link2Off,
  X,
  ExternalLink,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/actions/employee";

export default function EmployeeClientPage({
  data,
  totalPages,
  eligibleUsers,
  linkedUserIds,
}: {
  data: any[];
  totalPages: number;
  eligibleUsers: any[];
  linkedUserIds: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDelDialogOpen, setIsDelDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [nameInput, setNameInput] = useState("");
  // Default jenis diubah menjadi borongan jahit
  const [jenisInput, setJenisInput] = useState("borongan jahit");

  const [userSearch, setUserSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("q") || "";
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameInput(val);

    if (!selectedUserId) {
      setUserSearch(val);
      if (val.length > 2) setIsDropdownOpen(true);
    }
  };

  const filteredUsers = eligibleUsers.filter((u) => {
    const matchesSearch =
      u.fullname.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase());

    const isNotLinkedToOthers =
      !linkedUserIds.includes(u.id) ||
      (selectedEmp && selectedEmp.userId === u.id);

    return matchesSearch && isNotLinkedToOthers;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (emp: any = null) => {
    setSelectedEmp(emp);
    if (emp) {
      setNameInput(emp.name);
      setJenisInput(emp.jenis);
      setSelectedUserId(emp.userId);
      setUserSearch("");
    } else {
      setNameInput("");
      setJenisInput("borongan jahit");
      setSelectedUserId(null);
      setUserSearch("");
    }
    setIsModalOpen(true);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: nameInput,
      jenis: jenisInput,
      userId: selectedUserId,
    };

    const res = selectedEmp
      ? await updateEmployee(selectedEmp.id, payload)
      : await createEmployee(payload);

    setIsSubmitting(false);

    if (res.success) {
      toast({ title: "Berhasil", description: res.message });
      setIsModalOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  async function confirmDelete() {
    if (!selectedEmp) return;
    setIsSubmitting(true);
    const res = await deleteEmployee(selectedEmp.id);
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

  // Fungsi helper untuk menentukan warna badge berdasarkan jenis karyawan
  const getBadgeColor = (jenis: string) => {
    switch (jenis) {
      case "borongan jahit":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "borongan potong":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "harian":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Top Controls --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="Cari nama karyawan..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-blue-500/30"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchQuery}
          />
        </div>
        <Button
          onClick={() => openModal()}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Karyawan</span>
        </Button>
      </div>

      {/* --- Table Container --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200">
                <TableHead className="h-12 px-6 font-semibold text-slate-600">
                  Nama Karyawan
                </TableHead>
                <TableHead className="h-12 px-6 font-semibold text-slate-600">
                  Jenis Sistem Gaji
                </TableHead>
                <TableHead className="h-12 px-6 font-semibold text-slate-600">
                  Akun Sistem Tertaut
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
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`capitalize px-2.5 py-0.5 ${getBadgeColor(item.jenis)}`}
                      >
                        {item.jenis}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      {item.userId ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Link2 className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {item.userFullname}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              @{item.userUsername}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md w-fit border border-slate-100">
                          <Link2Off className="h-4 w-4" /> Tanpa akses login
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openModal(item)}
                        >
                          <Edit className="h-4 w-4 mr-1.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedEmp(item);
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
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users className="h-8 w-8 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        Tidak ada data karyawan.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- Pagination --- */}
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

      {/* ================= MODAL FORM KARYAWAN ================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-visible rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 rounded-t-2xl">
            <DialogTitle className="text-white text-lg font-semibold">
              {selectedEmp ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-1">
              Lengkapi informasi tenaga kerja di bawah ini.
            </DialogDescription>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 space-y-6 bg-white rounded-b-2xl"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Nama Karyawan
              </Label>
              <Input
                id="name"
                value={nameInput}
                onChange={handleNameChange}
                required
                placeholder="Nama Karyawan"
                className="h-11 rounded-lg bg-slate-50"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Jenis Pembayaran / Tugas
              </Label>
              {/* Diubah menjadi 3 kolom untuk mengakomodasi 3 pilihan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Label
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center ${jenisInput === "borongan jahit" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value="borongan jahit"
                    className="sr-only"
                    checked={jenisInput === "borongan jahit"}
                    onChange={(e) => setJenisInput(e.target.value)}
                  />
                  <div
                    className={`h-4 w-4 rounded-full border mb-2 flex items-center justify-center ${jenisInput === "borongan jahit" ? "border-blue-600" : "border-slate-300"}`}
                  >
                    {jenisInput === "borongan jahit" && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${jenisInput === "borongan jahit" ? "text-blue-700" : "text-slate-600"}`}
                  >
                    Borongan Jahit
                  </span>
                </Label>

                <Label
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center ${jenisInput === "borongan potong" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value="borongan potong"
                    className="sr-only"
                    checked={jenisInput === "borongan potong"}
                    onChange={(e) => setJenisInput(e.target.value)}
                  />
                  <div
                    className={`h-4 w-4 rounded-full border mb-2 flex items-center justify-center ${jenisInput === "borongan potong" ? "border-blue-600" : "border-slate-300"}`}
                  >
                    {jenisInput === "borongan potong" && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${jenisInput === "borongan potong" ? "text-blue-700" : "text-slate-600"}`}
                  >
                    Borongan Potong
                  </span>
                </Label>

                <Label
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center ${jenisInput === "harian" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input
                    type="radio"
                    name="jenis"
                    value="harian"
                    className="sr-only"
                    checked={jenisInput === "harian"}
                    onChange={(e) => setJenisInput(e.target.value)}
                  />
                  <div
                    className={`h-4 w-4 rounded-full border mb-2 flex items-center justify-center ${jenisInput === "harian" ? "border-blue-600" : "border-slate-300"}`}
                  >
                    {jenisInput === "harian" && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold ${jenisInput === "harian" ? "text-blue-700" : "text-slate-600"}`}
                  >
                    Harian
                  </span>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Tautkan ke Akun Login
                </Label>
                {selectedUserId ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                    Tertaut
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-slate-500 border-slate-200 bg-slate-50"
                  >
                    Opsional
                  </Badge>
                )}
              </div>

              {selectedUserId ? (
                <div className="flex items-center justify-between p-3 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 rounded-full p-1.5">
                      <Link2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-900">
                        {
                          eligibleUsers.find((u) => u.id === selectedUserId)
                            ?.fullname
                        }
                      </span>
                      <span className="text-xs font-medium text-emerald-700">
                        @
                        {
                          eligibleUsers.find((u) => u.id === selectedUserId)
                            ?.username
                        }
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100"
                    onClick={() => {
                      setSelectedUserId(null);
                      setUserSearch("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Ketik untuk mencari akun sistem..."
                    className="pl-9 h-11 rounded-lg border-slate-300 focus-visible:ring-blue-500/30"
                  />

                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <span className="text-[11px] text-slate-500">Opsional</span>
                    <Link
                      href="/dashboard/master/users"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                    >
                      Tambah Akun Karyawan <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto overflow-x-hidden top-[44px]">
                      {filteredUsers.length > 0 ? (
                        <div className="p-1">
                          {filteredUsers.map((u) => (
                            <div
                              key={u.id}
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setIsDropdownOpen(false);
                              }}
                              className="flex items-center justify-between p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">
                                  {u.fullname}
                                </span>
                                <span className="text-xs text-slate-500">
                                  @{u.username} ({u.role})
                                </span>
                              </div>
                              <UserPlus className="h-4 w-4 text-slate-300" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-sm text-slate-500 text-center font-medium">
                          {userSearch
                            ? `Tidak ada akun tersedia dengan nama "${userSearch}".`
                            : "Semua akun telah tertaut ke karyawan lain."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
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
                    Memproses...
                  </>
                ) : (
                  "Simpan Data"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDelDialogOpen}
        onClose={() => {
          setIsDelDialogOpen(false);
          setSelectedEmp(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
        title="Hapus Data Karyawan?"
        description={`Anda akan menghapus data karyawan "${selectedEmp?.name}".`}
      />
    </div>
  );
}

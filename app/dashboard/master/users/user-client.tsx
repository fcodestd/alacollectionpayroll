// app/dashboard/master/users/user-client.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Search,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  User as UserIcon,
  Loader2,
  Crown,
  Briefcase,
  Edit,
} from "lucide-react";

// Import Shadcn Components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Simulasi Server Actions (Pastikan ada fungsi updateUser di actions Anda)
import { createUser, updateUser, deleteUser } from "@/lib/actions/user";

export default function UserClientPage({
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

  // State Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDelDialogOpen, setIsDelDialogOpen] = useState(false);

  // State Data
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
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
  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);

    const res = await createUser(values);
    setIsSubmitting(false);

    if (res.success) {
      toast({
        title: "Akun Dibuat",
        description: "Pengguna baru berhasil ditambahkan.",
      });
      setIsAddModalOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  async function handleEditUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);

    // Mengirim ID user yang diedit dan datanya
    const res = await updateUser(selectedUser.id, values);
    setIsSubmitting(false);

    if (res.success) {
      toast({
        title: "Berhasil Diperbarui",
        description: "Data profil akun telah disimpan.",
      });
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
    if (!selectedUser || selectedUser.role === "owner") return;
    setIsSubmitting(true);
    const res = await deleteUser(selectedUser.id);
    setIsSubmitting(false);

    if (res.success) {
      toast({
        title: "Akun Dihapus",
        description: "Data pengguna telah dihapus permanen.",
      });
      setIsDelDialogOpen(false);
    } else {
      toast({
        title: "Gagal",
        description: res.message,
        variant: "destructive",
      });
    }
  }

  // Helper Ikon Role
  const renderRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 flex w-fit items-center gap-1.5 px-2.5 py-0.5">
            <Crown className="h-3 w-3" /> Owner (Super Admin)
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200 flex w-fit items-center gap-1.5 px-2.5 py-0.5">
            <Shield className="h-3 w-3" /> Administrator
          </Badge>
        );
      case "karyawan":
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 flex w-fit items-center gap-1.5 px-2.5 py-0.5">
            <Briefcase className="h-3 w-3" /> Karyawan
          </Badge>
        );
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
            placeholder="Cari berdasarkan nama atau username..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-blue-500/30"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchQuery}
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrasi Akun</span>
        </Button>
      </div>

      {/* --- Table Container --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
                <TableHead className="h-12 px-6 font-semibold text-slate-600 w-[40%]">
                  Profil Pengguna
                </TableHead>
                <TableHead className="h-12 px-6 font-semibold text-slate-600">
                  Hak Akses
                </TableHead>
              
                <TableHead className="h-12 px-6 font-semibold text-slate-600 text-right">
                  Manajemen
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((user) => {
                  const isOwner = user.role?.toLowerCase() === "owner";
                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                            ${isOwner ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {isOwner ? (
                              <Crown className="h-5 w-5" />
                            ) : (
                              <UserIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">
                              {user.fullname}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        {renderRoleBadge(user.role)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Tombol Edit tersedia untuk semua role, termasuk Owner */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1.5" /> Edit
                          </Button>

                          {/* Tombol Hapus disembunyikan jika dia Owner */}
                          {!isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDelDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="h-8 w-8 mb-3 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        Tidak ada data pengguna.
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

      {/* =========================================
          MODAL 1: TAMBAH USER
          ========================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-white text-lg font-semibold">
              Registrasi Akun Sistem
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-1.5 text-sm">
              Buat identitas *login* baru dan tentukan hak akses operasionalnya.
            </DialogDescription>
          </div>

          <form
            onSubmit={handleAddUser}
            className="px-6 py-6 space-y-5 bg-white"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="add-fullname"
                  className="text-sm font-medium text-slate-700"
                >
                  Display Name
                </Label>
                <Input
                  id="add-fullname"
                  name="fullname"
                  required
                  placeholder="Contoh: Admin Utama"
                  className="h-11 rounded-lg bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="add-username"
                  className="text-sm font-medium text-slate-700"
                >
                  Username Login
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-medium text-sm">
                    @
                  </span>
                  <Input
                    id="add-username"
                    name="username"
                    required
                    placeholder="admin"
                    className="pl-8 h-11 rounded-lg bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="add-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Kata Sandi
                </Label>
                <Input
                  id="add-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  className="h-11 rounded-lg bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="add-role"
                  className="text-sm font-medium text-slate-700"
                >
                  Level Akses (Role)
                </Label>
                <Select name="role" required defaultValue="admin">
                  <SelectTrigger className="h-11 rounded-lg bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Pilih tingkat akses..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      Administrator (Input Data)
                    </SelectItem>
                    <SelectItem value="karyawan">
                      Karyawan (Hanya Lihat Data)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-11 px-6 rounded-xl border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Memproses...
                  </>
                ) : (
                  "Simpan Akun"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================
          MODAL 2: EDIT USER
          ========================================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl">
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-white text-lg font-semibold">
              Edit Profil Akun
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-1.5 text-sm">
              Perbarui informasi pengguna. Kosongkan password jika tidak ingin
              mengubahnya.
            </DialogDescription>
          </div>

          {/* Render form hanya jika ada selectedUser untuk menghindari error defaultValue undefined */}
          {selectedUser && (
            <form
              onSubmit={handleEditUser}
              className="px-6 py-6 space-y-5 bg-white"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-fullname"
                    className="text-sm font-medium text-slate-700"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="edit-fullname"
                    name="fullname"
                    defaultValue={selectedUser.fullname}
                    required
                    className="h-11 rounded-lg bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-username"
                    className="text-sm font-medium text-slate-700"
                  >
                    Username Login
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 font-medium text-sm">
                      @
                    </span>
                    <Input
                      id="edit-username"
                      name="username"
                      defaultValue={selectedUser.username}
                      required
                      className="pl-8 h-11 rounded-lg bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Kata Sandi Baru (Opsional)
                  </Label>
                  <Input
                    id="edit-password"
                    name="password"
                    type="password"
                    placeholder="Biarkan kosong jika tidak diubah"
                    className="h-11 rounded-lg bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="edit-role"
                    className="text-sm font-medium text-slate-700"
                  >
                    Level Akses (Role)
                  </Label>
                  {/* Jika akun Owner, Select dibuat disabled agar role tidak bisa diubah */}
                  <Select
                    name="role"
                    defaultValue={selectedUser.role}
                    disabled={selectedUser.role === "owner"}
                  >
                    <SelectTrigger className="h-11 rounded-lg bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUser.role === "owner" && (
                        <SelectItem value="owner">
                          Owner (Super Admin)
                        </SelectItem>
                      )}
                      <SelectItem value="admin">
                        Administrator (Input Data)
                      </SelectItem>
                      <SelectItem value="karyawan">
                        Karyawan (Hanya Lihat Data)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedUser.role === "owner" && (
                    <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                      <Crown className="h-3 w-3" /> Hak akses Owner dilindungi
                      dan tidak dapat diubah.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-11 px-6 rounded-xl border-slate-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
          setSelectedUser(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
        title="Konfirmasi Pencabutan Akses"
        description="Apakah Anda yakin ingin menghapus akun ini secara permanen?"
      />
    </div>
  );
}
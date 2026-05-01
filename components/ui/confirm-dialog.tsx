// components/ui/confirm-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl border-none shadow-xl">
        {/* Area Konten Utama (Tengah) */}
        <div className="p-6 pt-8 flex flex-col items-center text-center bg-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-[6px] border-red-50/50">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <DialogHeader className="sm:text-center">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Area Tombol Aksi (Bawah) */}
        <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-1/2 h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-1/2 h-11 rounded-xl bg-red-600 hover:bg-red-700 shadow-sm font-semibold text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, ChevronRight, UserCircle, Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PotongRekapClient({ data }: { data: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const filteredData = data.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[60vh]">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama pemotong kain..."
            defaultValue={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-11 border-slate-200 bg-white"
          />
        </div>
      </div>
      <div className="p-2">
        {filteredData.length > 0 ? (
          <div className="grid gap-1">
            {filteredData.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-4 border border-transparent rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                    <UserCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{emp.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 font-medium">
                      <Scissors className="h-3.5 w-3.5" />{" "}
                      <span className="capitalize">{emp.jenis}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/dashboard/rekap/cutting/${emp.id}`)
                  }
                  className="bg-slate-900 hover:bg-indigo-600 text-white rounded-lg px-6"
                >
                  Lihat Hasil <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Karyawan tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

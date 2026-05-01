// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Package,
  ShieldCheck,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { PayrollChart } from "@/components/payroll-chart";
import DashboardFilter from "@/components/dashboard-filter";

// Import fungsi pengambil data asli
import {
  getDashboardStats,
  getDashboardChartData,
} from "@/lib/actions/dashboard";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage(props: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = (await props.searchParams) || {};
  const today = new Date();

  const selectedMonth =
    (params.month as string) || String(today.getMonth() + 1).padStart(2, "0");
  const selectedYear = (params.year as string) || String(today.getFullYear());

  // --- MENGAMBIL DATA DINAMIS DARI DATABASE ---

  // 1. Ambil Statistik Utama
  const stats = await getDashboardStats();

  // 2. Ambil Data Grafik (Gabungan Jahit, Potong, Harian) sesuai bulan & tahun
  const chartData = await getDashboardChartData(selectedMonth, selectedYear);
  const dynamicTotalPayroll = chartData.reduce(
    (acc, curr) => acc + curr.total,
    0,
  );

  const formatRp = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {/* 1. Header & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Statistik Operasional
          </h1>
          <p className="text-sm text-slate-500">
            Periode laporan:{" "}
            <span className="font-medium text-blue-600">
              {selectedMonth}/{selectedYear}
            </span>
          </p>
        </div>
        <DashboardFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>

      {/* 2. Grid Statistik Utama */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Karyawan",
            val: stats.totalEmployees.toString(),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Produk",
            val: stats.totalProducts.toString(),
            icon: Package,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Total Akun Aktif",
            val: stats.totalAdmins.toString(),
            icon: ShieldCheck,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {item.label}
              </span>
              <div className={`${item.bg} p-2 rounded-lg`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {item.val}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden relative rounded-2xl">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Banknote className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pengeluaran Gaji
            </span>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-black tracking-tighter text-emerald-400">
              {formatRp(dynamicTotalPayroll)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-slate-300 text-xs font-medium bg-slate-800/50 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sesuai Filter Bulan Ini</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Area Chart (Full Width) */}
      <div className="mt-6">
        <Card className="border-none shadow-sm rounded-2xl w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">
                Analisis Pengeluaran
              </CardTitle>
              <CardDescription>
                Visualisasi fluktuasi biaya payroll Jahit, Potong & Harian
              </CardDescription>
            </div>
            <div className="bg-slate-100 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart akan otomatis menyesuaikan lebar kontainer */}
            <div className="w-full h-[400px]">
              <PayrollChart data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

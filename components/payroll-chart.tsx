// components/payroll-chart.tsx
"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function PayrollChart({ data }: { data: any[] }) {
  // Menggunakan useMemo untuk menjaga stabilitas data saat render
  const memoizedData = useMemo(() => data, [data]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={memoizedData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        {/* Grid minimalis hanya garis horizontal */}
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />

        <XAxis
          dataKey="date"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval="preserveStartEnd"
        />

        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${value / 1000}k`}
        />

        <Tooltip
          cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
          }}
          // Animasi tooltip dimatikan agar tidak lag saat kursor bergerak cepat
          isAnimationActive={false}
          formatter={(value: number) =>
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(value)
          }
          labelFormatter={(label) => `Tanggal ${label}`}
        />

        <Line
          type="monotone" // Membuat garis melengkung smooth
          dataKey="total"
          stroke="#2563eb" // Warna biru utama
          strokeWidth={3}
          dot={false} // Menghilangkan titik default agar tampilan minimalis
          activeDot={{
            r: 6,
            fill: "#2563eb",
            stroke: "#fff",
            strokeWidth: 3,
          }}
          // Pengaturan animasi agar mengalir mulus
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

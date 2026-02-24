"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { pt } from "@/shared/i18n/pt";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ReportsQueries } from "@/services/queries/reports";

export default function ReportsPage() {
  const { data, isLoading, error } = ReportsQueries.useLoadReports();

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {pt.reports}
      </h1>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Crescimento do plantel (por data de criação)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chickenGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: number | undefined) => [
                    v != null ? String(v) : "",
                    "Galinhas",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#111827"
                  strokeWidth={2}
                  name="Galinhas"
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Produção de ovos (estimada) mês a mês
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyEggs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: number | undefined) => [v ?? 0, "Ovos"]}
                />
                <Bar
                  dataKey="eggs"
                  fill="#4b5563"
                  name="Ovos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Receita mês a mês
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$ ${v}`}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [
                    `R$ ${Number(v ?? 0).toFixed(2)}`,
                    "Receita",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#059669"
                  name="Receita"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            Lucro mês a mês
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyProfit}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$ ${v}`}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [
                    `R$ ${Number(v ?? 0).toFixed(2)}`,
                    "Lucro",
                  ]}
                />
                <Bar
                  dataKey="profit"
                  fill="#2563eb"
                  name="Lucro"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

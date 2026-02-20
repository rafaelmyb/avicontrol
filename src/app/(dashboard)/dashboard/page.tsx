"use client";

import { useQuery } from "@tanstack/react-query";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from "recharts";
import { pt } from "@/shared/i18n/pt";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeedRestockCard } from "@/components/feed-restock-card";

interface ChartPoint {
  month: string;
  count?: number;
  eggs?: number;
  revenue?: number;
  profit?: number;
}

interface DashboardCharts {
  chickenGrowth: ChartPoint[];
  monthlyEggs: ChartPoint[];
  monthlyRevenue: ChartPoint[];
  monthlyProfit: ChartPoint[];
}

interface FeedRestockAlertItem {
  feedType: string;
  label: string;
  date: string | null;
}

interface DashboardData {
  totalChickens: number;
  layingChickens: number;
  broodingChickens: number;
  estimatedMonthlyEggs: number | null;
  monthlyExpenses: number;
  monthlyRevenue: number;
  estimatedEggRevenue: number;
  monthlyRevenueWithEggs: number;
  monthlyProfit: number;
  feedRestockAlerts: FeedRestockAlertItem[];
  upcomingBroodEvents: { id: string; chickenName: string; date: string }[];
  charts?: DashboardCharts;
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchOnMount: "always",
  });

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
        {pt.dashboard}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title={pt.monthlyExpenses}
          value={`R$ ${data.monthlyExpenses.toFixed(2)}`}
        />
        <Card
          title={pt.monthlyRevenue}
          value={`R$ ${data.monthlyRevenueWithEggs.toFixed(2)}`}
        />
        <Card
          title={pt.monthlyProfit}
          value={`R$ ${data.monthlyProfit.toFixed(2)}`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={pt.totalChickens} value={data.totalChickens} />
        <Card title={pt.layingChickens} value={data.layingChickens} />
        <Card title={pt.broodingChickens} value={data.broodingChickens} />
        <Card
          title={pt.estimatedMonthlyEggs}
          value={data.estimatedMonthlyEggs ?? pt.noData}
        />
      </div>

      <div className="mt-6">
        <FeedRestockCard alerts={data.feedRestockAlerts} />
      </div>

      {/* {data.charts && (
        <div className="mt-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Crescimento do plantel (por data de criação)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.chickenGrowth}>
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
                <BarChart data={data.charts.monthlyEggs}>
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
                <BarChart data={data.charts.monthlyRevenue}>
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
                <BarChart data={data.charts.monthlyProfit}>
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
      )} */}

      {data.upcomingBroodEvents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {pt.upcomingBroodEvents}
          </h2>
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.upcomingBroodEvents.map((ev) => (
              <li key={ev.id} className="px-4 py-3 text-sm text-gray-700">
                {ev.chickenName} –{" "}
                {new Date(ev.date).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

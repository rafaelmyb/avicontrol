"use client";

import { useQuery } from "@tanstack/react-query";
import { pt } from "@/shared/i18n/pt";

interface DashboardData {
  totalChickens: number;
  layingChickens: number;
  broodingChickens: number;
  estimatedMonthlyEggs: number | null;
  monthlyProfit: number | null;
  feedRestockAlert: { name: string; date: string } | null;
  upcomingBroodEvents: { id: string; chickenName: string; date: string }[];
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">{pt.loading}</p>
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{pt.dashboard}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={pt.totalChickens} value={data.totalChickens} />
        <Card title={pt.layingChickens} value={data.layingChickens} />
        <Card title={pt.broodingChickens} value={data.broodingChickens} />
        <Card
          title={pt.estimatedMonthlyEggs}
          value={data.estimatedMonthlyEggs ?? pt.noData}
        />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card
          title={pt.monthlyProfit}
          value={
            data.monthlyProfit != null
              ? `R$ ${data.monthlyProfit.toFixed(2)}`
              : pt.noData
          }
        />
        {data.feedRestockAlert && (
          <Card
            title={pt.feedRestockAlert}
            value={`${data.feedRestockAlert.name}: ${new Date(data.feedRestockAlert.date).toLocaleDateString("pt-BR")}`}
          />
        )}
      </div>
      {data.upcomingBroodEvents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {pt.upcomingBroodEvents}
          </h2>
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {data.upcomingBroodEvents.map((ev) => (
              <li key={ev.id} className="px-4 py-3 text-sm text-gray-700">
                {ev.chickenName} – {new Date(ev.date).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

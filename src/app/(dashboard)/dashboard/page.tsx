"use client";

import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { type PeriodPreset } from "@/shared/period";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeedRestockCard } from "@/components/feed-restock-card";
import { DashboardQueries } from "@/services/queries/dashboard";

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodPreset>("current_month");
  const { data, isLoading, error } = DashboardQueries.useLoadDashboard(period);

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{pt.dashboard}</h1>
        <div className="flex items-center gap-2">
          <label
            htmlFor="period-select"
            className="text-sm text-gray-500 whitespace-nowrap"
          >
            {pt.period}:
          </label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="current_month">{pt.currentMonth}</option>
            <option value="last_30_days">{pt.last30Days}</option>
            <option value="current_year">{pt.currentYear}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          title={pt.periodExpenses}
          value={`R$ ${data.monthlyExpenses.toFixed(2)}`}
        />
        <Card
          title={pt.periodRevenue}
          value={`R$ ${data.monthlyRevenueWithEggs.toFixed(2)}`}
        />
        <Card
          title={pt.periodProfit}
          value={`R$ ${data.monthlyProfit.toFixed(2)}`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={pt.totalChickens} value={data.totalChickens} />
        <Card title={pt.layingChickens} value={data.layingChickens} />
        <Card title={pt.broodingChickens} value={data.broodingChickens} />
        <Card
          title={pt.periodEstimatedEggs}
          value={data.estimatedMonthlyEggs != null ? Math.round(data.estimatedMonthlyEggs) : pt.noData}
        />
      </div>

      <div className="mt-6">
        {data.upcomingBroodEvents.length > 0 && (
          <Card
            title={pt.upcomingBroodEvents}
            value={
              <ul>
                {data.upcomingBroodEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="text-sm flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      {ev.chickenName}
                    </span>
                    <span className="text-gray-600 font-normal">
                      {new Date(ev.date).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            }
          />
        )}
      </div>

      <div className="mt-6">
        <FeedRestockCard alerts={data.feedRestockAlerts} />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

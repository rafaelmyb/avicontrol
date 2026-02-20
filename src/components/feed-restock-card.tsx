"use client";

import { pt } from "@/shared/i18n/pt";

export interface FeedRestockAlertItem {
  feedType: string;
  label: string;
  date: string | null;
}

interface FeedRestockCardProps {
  alerts: FeedRestockAlertItem[];
}

export const FeedRestockCard = ({ alerts }: FeedRestockCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">{pt.feedRestockAlert}</p>
      <ul className="mt-2 space-y-1">
        {alerts.map((item) => (
          <li
            key={item.feedType}
            className="flex items-center justify-between text-sm flex-wrap gap-1"
          >
            <span className="font-medium text-gray-900">{item.label}</span>
            <span className="text-gray-600">
              {item.date
                ? new Date(item.date).toLocaleDateString("pt-BR")
                : pt.feedNoStock}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

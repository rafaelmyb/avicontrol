"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { pt } from "@/shared/i18n/pt";

interface ChickenDto {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  ageInDays: number;
}

const statusLabel: Record<string, string> = {
  chick: pt.chick,
  pullet: pt.pullet,
  laying: pt.laying,
  brooding: pt.brooding,
  recovering: pt.recovering,
  retired: pt.retired,
  sold: pt.sold,
  deceased: pt.deceased,
};

export function ChickenList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chickens"],
    queryFn: async () => {
      const res = await fetch("/api/chickens?take=100");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.chickens as ChickenDto[];
    },
  });

  if (isLoading) return <p className="text-gray-500">{pt.loading}</p>;
  if (error) return <p className="text-red-600">{pt.error}</p>;
  if (!data?.length) return <p className="text-gray-500">{pt.noChickens}</p>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {pt.chickenName}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {pt.breed}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {pt.status}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {pt.age}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              {pt.edit}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{c.breed}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {statusLabel[c.status] ?? c.status}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {pt.ageDays(c.ageInDays)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/chickens/${c.id}`}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  {pt.edit}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import Link from "next/link";
import { pt } from "@/shared/i18n/pt";
import { ChickenList } from "@/modules/chicken/presentation/chicken-list";

export default function ChickensPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{pt.chickens}</h1>
        <Link
          href="/chickens/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          {pt.addChicken}
        </Link>
      </div>
      <ChickenList />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { pt } from "@/shared/i18n/pt";

interface DashboardSidebarProps {
  user: { id: string; email?: string | null; name?: string | null };
}

const nav = [
  { href: "/dashboard", label: pt.dashboard },
  { href: "/chickens", label: pt.chickens },
  { href: "/brood", label: pt.brood },
  { href: "/feed", label: pt.feed },
  { href: "/finance", label: pt.finance },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="font-semibold text-gray-900">
          {pt.appName}
        </Link>
      </div>
      <nav className="flex-1 p-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-sm ${
              pathname === item.href
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-200">
        <p className="px-3 py-1 text-xs text-gray-500 truncate" title={user.email ?? undefined}>
          {user.email}
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
        >
          {pt.logout}
        </button>
      </div>
    </aside>
  );
}

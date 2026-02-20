"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { pt } from "@/shared/i18n/pt";
import {
  IconDashboard,
  IconPets,
  IconEgg,
  IconRestaurant,
  IconAttachMoney,
  IconSettings,
  IconLogout,
} from "@/components/icons/material-sidebar-icons";

interface DashboardSidebarProps {
  user: { id: string; email?: string | null; name?: string | null };
  open: boolean;
  collapsed: boolean;
  isLg: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const ICON_SIZE = 22;

const nav = [
  { href: "/dashboard", label: pt.dashboard, icon: IconDashboard },
  { href: "/chickens", label: pt.chickens, icon: IconPets },
  { href: "/brood", label: pt.brood, icon: IconEgg },
  { href: "/feed", label: pt.feed, icon: IconRestaurant },
  { href: "/finance", label: pt.finance, icon: IconAttachMoney },
];

export function DashboardSidebar({
  user,
  open,
  collapsed,
  isLg,
  onClose,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const overlayClasses = !isLg
    ? `fixed top-0 left-0 z-40 h-full w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen transition-transform duration-200 ease-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`
    : "";

  const desktopClasses = isLg
    ? `flex flex-col min-h-screen bg-white border-r border-gray-200 shrink-0 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`
    : "";

  const asideClassName = !isLg ? overlayClasses : desktopClasses;

  return (
    <aside className={asideClassName}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
        {collapsed && isLg ? (
          <Link
            href="/dashboard"
            className="font-semibold text-gray-900 text-lg leading-none"
            title={pt.appName}
          >
            A
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="font-semibold text-gray-900 truncate"
          >
            {pt.appName}
          </Link>
        )}
        {isLg ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 shrink-0"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 shrink-0"
            aria-label="Fechar menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => !isLg && onClose()}
              title={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                pathname === item.href
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${collapsed && isLg ? "justify-center" : ""}`}
            >
              <Icon className="shrink-0" size={ICON_SIZE} />
              {!(collapsed && isLg) && item.label}
            </Link>
          );
        })}
      </nav>
      <div
        className="p-2 border-t border-gray-200 space-y-0.5"
        style={{
          paddingBottom: !isLg
            ? "calc(env(safe-area-inset-bottom) + 8rem)"
            : "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        {!(collapsed && isLg) && (
          <p
            className="px-3 py-1 text-xs text-gray-500 truncate"
            title={user.email ?? undefined}
          >
            {user.email}
          </p>
        )}
        <Link
          href="/settings"
          onClick={() => !isLg && onClose()}
          title={pt.settings}
          aria-label={pt.settings}
          className={`flex items-center gap-3 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
            collapsed && isLg ? "justify-center px-2 py-2" : "px-3 py-2"
          }`}
        >
          <IconSettings className="shrink-0" size={ICON_SIZE} />
          {!(collapsed && isLg) && pt.settings}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={pt.logout}
          aria-label={pt.logout}
          className={`w-full flex items-center rounded-md text-sm text-gray-600 hover:bg-gray-50 ${
            collapsed && isLg
              ? "justify-center px-2 py-2 gap-0"
              : "gap-3 px-3 py-2 text-left"
          }`}
        >
          <IconLogout className="shrink-0" size={ICON_SIZE} />
          {!(collapsed && isLg) && pt.logout}
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

const LG = 1024;

interface DashboardShellProps {
  user: { id: string; email?: string | null; name?: string | null };
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = "avicontrol-sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLg, setIsLg] = useState(true);

  useEffect(() => {
    setSidebarCollapsed(getInitialCollapsed());
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG}px)`);
    const handler = () => {
      const next = mq.matches;
      setIsLg(next);
      if (!next) setSidebarOpen(false);
    };
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <DashboardSidebar
        user={user}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        isLg={isLg}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      {!isLg && (
        <div className="fixed top-0 left-0 right-0 z-20 h-12 bg-white border-b border-gray-200 flex items-center px-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 font-semibold text-gray-900">AviControl</span>
        </div>
      )}
      <main className={`flex-1 overflow-auto ${!isLg ? "pt-12" : ""}`}>{children}</main>
      {!isLg && sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar overlay"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

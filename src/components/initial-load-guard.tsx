"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

interface InitialLoadGuardProps {
  children: React.ReactNode;
}

export const InitialLoadGuard = ({ children }: InitialLoadGuardProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner minHeight="min-h-0" />
      </div>
    );
  }

  return <>{children}</>;
};

"use client";

import Link from "next/link";

interface FormPageHeaderProps {
  title: string;
  backHref: string;
  backLabel: string;
}

export const FormPageHeader = ({ title, backHref, backLabel }: FormPageHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    <Link href={backHref} className="text-sm text-gray-600 hover:text-gray-900">
      ← {backLabel}
    </Link>
  </div>
);

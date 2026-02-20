"use client";

import Link from "next/link";
import { IconEdit, IconDelete } from "@/components/icons/material-sidebar-icons";
import { pt } from "@/shared/i18n/pt";

const ICON_SIZE = 18;

interface ActionIconButtonBaseProps {
  title?: string;
  className?: string;
}

export const EditLink = ({ href, title = pt.edit, className = "" }: ActionIconButtonBaseProps & { href: string }) => (
  <Link
    href={href}
    title={title}
    className={`inline-flex items-center justify-center p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${className}`}
    aria-label={title}
  >
    <IconEdit size={ICON_SIZE} />
  </Link>
);

interface EditButtonProps extends ActionIconButtonBaseProps {
  onClick: () => void;
}

export const EditButton = ({ onClick, title = pt.edit, className = "" }: EditButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex items-center justify-center p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${className}`}
    aria-label={title}
  >
    <IconEdit size={ICON_SIZE} />
  </button>
);

interface DeleteButtonProps extends ActionIconButtonBaseProps {
  onClick: () => void;
  disabled?: boolean;
}

export const DeleteButton = ({ onClick, title = pt.delete, disabled = false, className = "" }: DeleteButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center p-1.5 rounded text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    aria-label={title}
  >
    <IconDelete size={ICON_SIZE} />
  </button>
);

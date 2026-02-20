"use client";

/**
 * Material-style sidebar icons as inline SVGs (paths from Material Icons).
 * No external icon library — minimal bundle impact.
 */

interface IconProps {
  className?: string;
  size?: number;
}

const defaultSize = 24;

function IconSvg({
  d,
  className,
  size = defaultSize,
}: IconProps & { d: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

// Dashboard (Material: dashboard)
export function IconDashboard({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      className={className}
      size={size}
    />
  );
}

// Pets (Material: pets) — Galinhas
export function IconPets({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M4.5 9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S6.83 11 6 11s-1.5-.67-1.5-1.5zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-4.5 4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm6.5 1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM19 8c.83 0 1.5-.67 1.5-1.5S19.83 5 19 5s-1.5.67-1.5 1.5S18.17 8 19 8zm0 4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm.5 3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"
      className={className}
      size={size}
    />
  );
}

// Egg (Material: egg) — Choco
export function IconEgg({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M12 3C8.5 3 6 5.58 6 9c0 2.72 1.62 5.23 4 6.5V21h4v-5.5c2.38-1.27 4-3.78 4-6.5 0-3.42-2.5-6-6-6z"
      className={className}
      size={size}
    />
  );
}

// Restaurant (Material: restaurant) — Ração
export function IconRestaurant({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8h2.5V2c-2.76 0-5 2.24-5 4z"
      className={className}
      size={size}
    />
  );
}

// AttachMoney (Material: attach_money) — Financeiro
export function IconAttachMoney({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.24-3.9V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
      className={className}
      size={size}
    />
  );
}

// Settings (Material: settings)
export function IconSettings({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      className={className}
      size={size}
    />
  );
}

// Logout (Material: logout) — Sair
export function IconLogout({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
      className={className}
      size={size}
    />
  );
}

// Edit (pencil) — table action
export function IconEdit({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      className={className}
      size={size}
    />
  );
}

// Delete (trash) — table action
export function IconDelete({ className, size }: IconProps) {
  return (
    <IconSvg
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      className={className}
      size={size}
    />
  );
}

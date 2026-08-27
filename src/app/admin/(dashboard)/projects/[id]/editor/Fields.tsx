"use client";

import type { ReactNode } from "react";

// Temp client-side ids for rows added in the editor before save (the server
// assigns real ids on create). A counter, not Date.now()/crypto — those are
// impure calls the React Compiler's purity lint flags when reachable from a
// component body.
let tempIdCounter = 0;
export function nextTempId(prefix: string) {
  tempIdCounter += 1;
  return `new-${prefix}-${tempIdCounter}`;
}

export const inputClass =
  "w-full rounded-md border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-ink-soft/50";
export const labelClass = "mb-1.5 block text-[13px] font-medium text-ink";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={inputClass}
      />
    </Field>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm text-ink group py-2">
      {label}
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-5 w-9 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50"></div>
        <div className="absolute left-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"></div>
      </div>
    </label>
  );
}

export function SmallButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger" | "accent";
}) {
  const toneClass =
    tone === "danger"
      ? "border-line text-ink-soft hover:border-red-600 hover:text-red-700 hover:bg-red-50"
      : tone === "accent"
        ? "border-accent text-accent hover:bg-accent hover:text-ivory shadow-sm"
        : "border-line text-ink-soft hover:border-ink hover:text-ink shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border mt-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all hover:-translate-y-[1px] ${toneClass}`}
    >
      {children}
    </button>
  );
}

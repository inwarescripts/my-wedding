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
  "w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-ink focus:border-accent focus:outline-none";
export const labelClass = "mb-1 block text-xs tracking-[0.2em] uppercase text-ink-soft";

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
    <label className="flex items-center justify-between text-sm text-ink">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
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
      ? "border-line text-ink-soft hover:border-red-700 hover:text-red-700"
      : tone === "accent"
        ? "border-accent text-accent hover:bg-accent hover:text-ivory"
        : "border-ink text-ink hover:bg-ink hover:text-ivory";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${toneClass}`}
    >
      {children}
    </button>
  );
}

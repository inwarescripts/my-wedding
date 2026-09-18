"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { vi } from "react-day-picker/locale";
import rdpStyles from "react-day-picker/style.module.css";

// Temp client-side ids for rows added in the editor before save (the server
// assigns real ids on create). A counter, not Date.now()/crypto — those are
// impure calls the React Compiler's purity lint flags when reachable from a
// component body.
//
// Kept on `globalThis`, not a plain module-scoped `let` — a module-scoped
// counter resets to 0 on every Fast Refresh (dev-only hot reload swaps the
// module's closures, but React keeps the existing component state/props),
// so adding rows, editing code, then adding more rows could mint an id
// that collides with one still sitting in the untouched React tree —
// exactly the "two children with the same key" this was seen with.
// `globalThis` isn't touched by a module reload, so the counter survives.
function nextCounterValue(): number {
  const g = globalThis as { __weddingTempIdCounter?: number };
  g.__weddingTempIdCounter = (g.__weddingTempIdCounter ?? 0) + 1;
  return g.__weddingTempIdCounter;
}
export function nextTempId(prefix: string) {
  return `new-${prefix}-${nextCounterValue()}`;
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} className={className}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </Field>
  );
}

/** A calendar-popover + time input for picking a date+time, storing it as
 * a UTC ISO string — replaces the plain `<input type="datetime-local">`
 * that used to back "Ngày cưới"/"Hạn sử dụng".
 *
 * That native input had a real off-by-one-day bug: its value is a LOCAL
 * "YYYY-MM-DDTHH:mm" string with no timezone, so `new Date(v)` correctly
 * parses it as local time — but `.slice(0, 16)` on the STORED UTC ISO
 * string for redisplay treated the UTC wall-clock digits as if they were
 * local, which silently shifts by the browser's UTC offset every time the
 * field is redrawn (e.g. re-opening the editor). For Vietnam (UTC+7),
 * picking a midnight date very visibly rendered back as the previous
 * evening.
 *
 * This component never touches the ISO string with substring slicing:
 * `date.getHours()/getMinutes()` reads the LOCAL wall-clock components
 * directly off the `Date` object (the correct, spec-guaranteed way), and
 * `date.setHours(...)` + `.toISOString()` converts a local wall-clock edit
 * back to UTC — so the same local moment always round-trips exactly. */
export function DateTimeField({
  label,
  value,
  onChange,
  className,
  clearable = false,
  showTime = true,
}: {
  label: string;
  value: string;
  onChange: (isoValue: string) => void;
  className?: string;
  /** Shows an "×" to reset the field back to an empty string — for
   * optional dates like "Hạn sử dụng" (no expiry). "Ngày cưới" always
   * needs a value, so it leaves this off. */
  clearable?: boolean;
  /** "Hạn sử dụng" is just a cutoff day, no meaningful time-of-day — hides
   * the time input so it can share one row with the date button and the
   * clear button instead of needing a second row just for the (unused)
   * time picker. "Ngày cưới" keeps it: the ceremony's actual start time is
   * shown on the site (countdown, "được cử hành vào lúc"). */
  showTime?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // The calendar popover is portalled straight to <body> (see below) — this
  // field lives inside the editor's scrollable left panel, and a plain
  // `position: absolute` popover was getting clipped by that ancestor's
  // `overflow-y-auto` the moment it would extend past the panel's visible
  // bounds, leaving the day cells rendered-but-unclickable (covered/hidden)
  // instead of overlaying the rest of the page like a dropdown should.
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const date = value ? new Date(value) : null;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideTrigger && !insidePopover) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Position the portalled popover against the trigger's real screen
  // position (fixed coordinates, immune to any ancestor's overflow
  // clipping) — recomputed each time it opens. Closes on scroll/resize
  // instead of continuously repositioning, same as a typical dropdown.
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleScrollOrResize() {
      setOpen(false);
    }
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  function commitDay(day: Date) {
    const next = new Date(day);
    if (date) next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(next.toISOString());
  }

  function commitTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const next = date ? new Date(date) : new Date();
    next.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(next.toISOString());
  }

  const timeValue = date
    ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : "00:00";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {showTime ? (
        // Date on its own row, time + "Xoá" on a second — a native
        // `<input type="time">` refuses to shrink below its own built-in
        // minimum width (locale-dependent, often 100px+) no matter what
        // width class it's given, so trying to fit it alongside the date
        // button and a clear button on one row kept squeezing (or fully
        // hiding) whichever control lost the fight. Two rows sidesteps that
        // entirely instead of fighting the browser's own control width.
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`${inputClass} text-left`}
          >
            {date
              ? date.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Chọn ngày"}
          </button>
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="time"
              value={timeValue}
              onChange={(e) => commitTime(e.target.value)}
              className={`${inputClass} w-fit`}
            />
            {clearable && date && (
              <button
                type="button"
                onClick={() => onChange("")}
                title="Xoá ngày, để trống = không giới hạn"
                className="shrink-0 whitespace-nowrap rounded-md border border-line px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Xoá
              </button>
            )}
          </div>
        </>
      ) : (
        // No time picker to fight for room with — date button and "Xoá"
        // comfortably share one row.
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`${inputClass} min-w-0 flex-1 truncate text-left`}
          >
            {date
              ? date.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Chọn ngày"}
          </button>
          {clearable && date && (
            <button
              type="button"
              onClick={() => onChange("")}
              title="Xoá ngày, để trống = không giới hạn"
              className="shrink-0 whitespace-nowrap rounded-md border border-line px-3 py-2.5 text-xs text-ink-soft transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              Xoá
            </button>
          )}
        </div>
      )}

      {open &&
        popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 rounded-md border border-line bg-ivory p-2 shadow-lg"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <DayPicker
              mode="single"
              selected={date ?? undefined}
              // Without this, DayPicker opens on *today's* month regardless
              // of what's already selected — for a wedding date months away
              // from today, that meant scrolling several months just to see
              // the picked day highlighted.
              defaultMonth={date ?? undefined}
              onSelect={(day) => {
                if (!day) return;
                commitDay(day);
                setOpen(false);
              }}
              locale={vi}
              classNames={rdpStyles}
              showOutsideDays
              // DayPicker's own stylesheet sets --rdp-accent-color etc.
              // directly on its root element (`.rdp-root { --rdp-accent-
              // color: blue; ... }`), which wins over the same variables set
              // on an ANCESTOR — an inherited custom property always loses
              // to any explicit declaration on the element itself, no matter
              // how it's set. `style` here targets that root element
              // directly, so it actually overrides the default blue.
              style={
                {
                  "--rdp-accent-color": "var(--color-accent)",
                  "--rdp-accent-background-color": "var(--color-accent-soft)",
                  "--rdp-today-color": "var(--color-accent)",
                } as CSSProperties
              }
            />
          </div>,
          document.body
        )}
    </div>
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

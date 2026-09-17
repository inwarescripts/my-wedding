"use client";

import { useState, useTransition } from "react";
import { setShowOnHomepage } from "./actions";

/** Admin-only checkbox — whether this project shows as a template card on
 * the public "/" homepage gallery. Optimistic: flips immediately, rolls
 * back if the server action throws. */
export function ShowOnHomepageToggle({
  projectId,
  initialValue,
}: {
  projectId: string;
  initialValue: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await setShowOnHomepage(projectId, next);
      } catch {
        setChecked(!next);
      }
    });
  }

  return (
    <label
      title="Hiển thị trên trang chủ"
      className="flex items-center gap-1.5 whitespace-nowrap text-xs uppercase tracking-widest text-ink-soft"
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-accent disabled:opacity-50"
      />
      Trang chủ
    </label>
  );
}

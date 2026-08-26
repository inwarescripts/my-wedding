"use client";

import { useTransition } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Xoá tài khoản này? Các dự án của họ sẽ không còn chủ sở hữu.")) return;
    startTransition(async () => {
      await deleteUser(userId);
    });
  }

  if (disabled) {
    return (
      <span className="px-2 py-1 text-xs text-ink-soft/40" title="Không thể tự xoá chính mình">
        —
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="border px-3 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-red-700 hover:text-red-700 disabled:opacity-40"
    >
      Xoá
    </button>
  );
}

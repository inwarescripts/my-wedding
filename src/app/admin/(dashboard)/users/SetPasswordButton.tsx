"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { resetUserPassword } from "./actions";

export function SetPasswordButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setPassword("");
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await resetUserPassword(userId, password);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="border px-3 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Đặt mật khẩu
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Đặt mật khẩu mới — @${username}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-ink-soft">
              Mật khẩu mới
            </label>
            <input
              type="password"
              autoFocus
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-sm text-ink focus:border-accent focus:outline-none"
            />
            {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="border border-line px-4 py-2 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="border border-ink bg-ink px-4 py-2 text-xs uppercase tracking-widest text-ivory transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

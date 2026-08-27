"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { cloneProject } from "./actions";

export function CloneProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setName(`${projectName} (Bản sao)`);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await cloneProject(projectId, trimmed);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Nhân bản dự án"
        className="whitespace-nowrap border border-line px-3 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Clone
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nhân bản dự án">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-ink-soft">
              Tên dự án mới
            </label>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-0 border-b border-line bg-transparent px-1 py-2 font-serif text-sm text-ink focus:border-accent focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              Tên này cũng dùng để tạo slug/đường dẫn lưu trữ ảnh cho dự án mới,
              tránh trùng với dự án gốc.
            </p>
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
              {isPending ? "Đang sao chép..." : "Nhân bản"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

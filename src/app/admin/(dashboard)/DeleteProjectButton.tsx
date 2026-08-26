"use client";

import { useTransition } from "react";
import { deleteProject } from "./actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Xoá vĩnh viễn dự án này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      await deleteProject(projectId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Xoá dự án"
      className="px-2 py-1 text-ink-soft transition-colors hover:text-red-700 disabled:opacity-40"
    >
      ✕
    </button>
  );
}
